"""Module for helpers functions in inventories app."""
import os
from datetime import datetime
from copy import copy 
from openpyxl import load_workbook, Workbook
import xml.etree.ElementTree as ET
from mailmerge import MailMerge
from docx import Document
import shutil
import zipfile
from django.core.exceptions import ValidationError
from django.conf import settings
from fonds.models import Fond
from inventories.models import Inventory
from inventories.helpers.constants import INVENTORY_MEDIA_TYPE
from project.helpers.constants import OPEX_PROGRESS_GROUP_NAME, SEND_TYPE_PROGRESS
from items.helpers.constants import ITEM_RESTRICTION_DEFAULT_VALUE
from project.helpers.helpers_lv import number_to_latvian, convert_to_feminine
from institutions.models import Institution
from records.models import Record,AudioRecord,PhotoRecord,VideoRecord,Action,Addressee,ReadStatus,Visa
from project.helpers.opex_xml_processor import OPEXXMLProcessor
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

#################################################################################

def export_project_to_opex(project_id, include_long_term=False):
    """" Export the entire project structure to OPEX format.
    The function creates a folder structure and fills in OPEX XML templates 
    with metadata from the database.
    
    arguments:
    project_id: ID of the project to export
    include_long_term: If False, skip inventories with long-term storage term.
    
    Returns:
    None: Saves the OPEX files in the defined folder structure.
    
    """
    
    channel_layer = get_channel_layer()
    
    async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_export_started","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
    
    templates_path=os.path.join(settings.BASE_DIR,"project","helpers","utils","doc_templates")
    template_edocs = os.path.join(templates_path,"opex-template-edocs.xml")
    template_media = os.path.join(templates_path,"opex-template-media.xml")
    template_folder = os.path.join(templates_path,"opex-template-folder.xml")
    
    
    inst_objects=Institution.objects.filter(project__id=project_id)
    institution=inst_objects.first()
    project=institution.project
    project_folder=project.folder
    output_folder = os.path.join(project_folder,"opex_export")
    complete_folder_size=0
    
    timestamp = datetime.now().strftime("%y%m%d-%H%M%S")
    os.makedirs(output_folder, exist_ok=True)
    export_name=f"export_{project_id}_{timestamp}"
    base_export_path=os.path.join(output_folder, export_name)
    zip_file_path = os.path.join(output_folder, export_name+'.zip')
    
    root_level_opex_file_path=os.path.join(base_export_path, f"{export_name}.opex")
    create_folder_level_opex(template_folder, root_level_opex_file_path, export_name, f"Projekta {project_id} opex nodevuma saknes mape.", "public")
    complete_folder_size+=os.path.getsize(root_level_opex_file_path)
    
    main_arch_prefix="LV_LNA"
    main_arch_prefix_descr="" #"Latvijas Nacionālais arhīvs"
    LV_level_path=os.path.join(base_export_path, main_arch_prefix)
    LV_level_opex_file_path=os.path.join(LV_level_path, f"{main_arch_prefix}.opex")
    create_folder_level_opex(template_folder, LV_level_opex_file_path, main_arch_prefix, f"{main_arch_prefix_descr}", "public")
    complete_folder_size+=os.path.getsize(LV_level_opex_file_path)
    
    fond_object=Fond.objects.filter(institution=institution).first()
    
    if fond_object:
        arch_abbreviation=fond_object.arch_abbreviation
        fond_number=fond_object.fond_number
        inventories=Inventory.objects.filter(fond=fond_object)
        
        ARCH_level_path=os.path.join(LV_level_path, f"{main_arch_prefix}_{arch_abbreviation}")
        os.makedirs(ARCH_level_path, exist_ok=True)
        arch_prefix=f"{main_arch_prefix}_{arch_abbreviation}"
        arch_prefix_descr="" #fond_object.arch_title
        arch_prefix_level_opex_file_path=os.path.join(ARCH_level_path, f"{arch_prefix}.opex")
        create_folder_level_opex(template_folder, arch_prefix_level_opex_file_path, arch_prefix, f"{arch_prefix_descr}", "public")
        complete_folder_size+=os.path.getsize(arch_prefix_level_opex_file_path)

        FOND_level_path=os.path.join(ARCH_level_path, f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}")
        os.makedirs(FOND_level_path, exist_ok=True)
        fond_prefix=f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}"
        fond_prefix_descr=fond_object.fond_title
        fond_prefix_level_opex_file_path=os.path.join(FOND_level_path, f"{fond_prefix}.opex")
        create_folder_level_opex(template_folder, fond_prefix_level_opex_file_path, fond_prefix, f"{fond_prefix_descr}", "public")
        complete_folder_size+=os.path.getsize(fond_prefix_level_opex_file_path)

        
        data=[]   
        
        for inventory in inventories:
            if include_long_term==False and inventory.storage_term=="Ilgstoši glabājamās lietas":
                continue
            if inventory.electronic==False:
                print(inventory.electronic)
                continue
            
            US_type_text="Nav norādīts"
            if inventory.type == "Tekstuāls" and inventory.electronic==True:
                US_type_text="Tekstuālie dokumenti elektroniskā formā"
            elif inventory.type in INVENTORY_MEDIA_TYPE and inventory.electronic==True:
                US_type_text=f"{inventory.type} dokumenti elektroniskā formā"

            INV_level_path=os.path.join(FOND_level_path, f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}")
            os.makedirs(INV_level_path, exist_ok=True)
            inventory_prefix=f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}"
            inventory_prefix_descr=f"{inventory.number}. uzskaites saraksts. {US_type_text}"
            inventory_prefix_level_opex_file_path=os.path.join(INV_level_path, f"{inventory_prefix}.opex")
            create_folder_level_opex(template_folder, inventory_prefix_level_opex_file_path, inventory_prefix, f"{inventory_prefix_descr}", "public")
            complete_folder_size+=os.path.getsize(inventory_prefix_level_opex_file_path)    

            items=inventory.items.all()
            if inventory.electronic:
                # GV līmenis    
                for item in items:

                    ITEM_level_path=os.path.join(INV_level_path, f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}_{item.number}")
                    os.makedirs(ITEM_level_path, exist_ok=True)

                    item_prefix=f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}_{item.number}"
                    item_prefix_descr=f"{item.title}"
                    item_level_opex_file_path=os.path.join(ITEM_level_path, f"{item_prefix}.opex")
                    create_folder_level_opex(template_folder, item_level_opex_file_path, item_prefix, f"{item_prefix_descr}", "public")
                    complete_folder_size+=os.path.getsize(item_level_opex_file_path)

                    apjmv=str(item.unit_of_measure)
                    if inventory.type=="Tekstuāls" and inventory.electronic==False:
                        apjmv="Lapas"
                    if inventory.type == "Foto":
                        item_records=PhotoRecord.objects.filter(item=item)
                    elif inventory.type == "Skaņas":
                        item_records=AudioRecord.objects.filter(item=item)
                    elif inventory.type == "Video":
                        item_records=VideoRecord.objects.filter(item=item)
                    else:
                        item_records=Record.objects.filter(item=item)  

                    filenames=[]                
                    extensions_set = set()
                    record_nr=0
                    for record in item_records:
                        record_nr+=1
                        item_total_file_size=0
                        # dokumenta līmenis
    
                        RECORD_level_path=os.path.join(ITEM_level_path, f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}_{item.number}_{record_nr}.pax")
                        os.makedirs(RECORD_level_path, exist_ok=True)
                        record_prefix=f"{main_arch_prefix}_{arch_abbreviation}_F{fond_number}_{inventory.number}_{item.number}_{record_nr}.pax"
                        
                        file_nr=0
                        for file in record.files.all():
                            file_nr+=1
                            
                            FILE_level_path=os.path.join(RECORD_level_path, "Representation_Preservation")
                            os.makedirs(FILE_level_path, exist_ok=True)
                            try:
                                shutil.copy2(file.path, FILE_level_path)
                                async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"file","file":file.id, "status":"copied","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
                                print(f"Kopēts fails: {file.path} uz {FILE_level_path}")
                            except Exception as e:
                                async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"file","file":file.id, "status":"copy_error","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
                                print(f"Kļūda kopējot failu: {file.path} uz {FILE_level_path}. \nKļūda: {e}")
                                continue
                            
                            
                            item_total_file_size+=int(file.size)
                            complete_folder_size+=int(file.size)
                            filenames.append(os.path.basename(file.path))
                            filename = os.path.basename(file.path)
                            ext = os.path.splitext(filename)[1][1:].lower()
                            if ext:
                                extensions_set.add(ext)

                        
                        dat_no=format_date(str(item.start_date), scope='day')
                        dat_lidz=format_date(str(item.end_date), scope='day')
                        periods_dat=dat_no if dat_lidz==dat_lidz else f"{dat_no}—{dat_lidz}"
                        
                        item_data = {
                        'title': f"{item.title}",
                        'description': f"{item.annotation}",
                        'record_id': record.id,
                        'title_proper': f"{item.title}",
                        'agency_code': f'LV_LNA_{fond_object.arch_abbreviation}',
                        'unit_title': 'glabājamā vienība',
                        'author_name': 'Dokumenta autors',
                        'agent': 'OPEX pakotņu sagatavošanas rīks. Izstrādes versija',
                        'event_datetime': datetime.now().strftime("%Y-%m-%d"),
                        'quantities': ['1', round((item_total_file_size/1024/1024),2)],
                        'unit_types': ['Glabājamā vienība', 'MB'],
                        }
                        

                        if inventory.type=="Tekstuāls" and inventory.electronic==True:

                            item_data_record = {}
                            addressee=Addressee.objects.filter(record_id=record.id).first()
                            
                            addressee_str=""
                            if addressee != None:
                                addressee_str=addressee
                                
                            if record.reg_nr is not None and record.sent_reg_nr is not None and institution.reg_nr is not None:
                                item_data_record = {'list_items': [institution.reg_nr, record.reg_nr, record.sent_reg_nr, record.group,None, record.nomenclature_nr,addressee_str]}

                            
                            if record.date is not None:
                                item_data_record['document_date'] = record.date.strftime("%Y-%m-%d")
                            if record.sent_date is not None:
                                item_data_record['sending_date'] = record.sent_date.strftime("%Y-%m-%d")

                            item_data_record['table_t1_data'] = []
                            item_data_record['table_t2_data'] = []
                            item_data_record['table_t3_data'] = []
                            
                            visas = Visa.objects.filter(record_id=record.id)\
                                  .values("person", "date", "notes")
                            for visa_object in visas:
                                if visa_object is not None:
                                    item_data_record['table_t1_data'].append([visa_object["person"], format_date(str(visa_object["date"]), scope='day'), visa_object["notes"]])

                            read_statuses = ReadStatus.objects.filter(record_id=record.id)\
                                  .values("person", "date", "notes")
                            for read_status in read_statuses:    
                                if read_status is not None:
                                    item_data_record['table_t2_data'].append([read_status["person"], format_date(str(read_status["date"]), scope='day'), read_status["notes"]])
                                
                            doc_actions = Action.objects.filter(record_id=record.id)\
                                .values("author", "responsible_person","task","due_date","created_date","notes")
                            for doc_action in doc_actions:    
                                if doc_action is not None:
                                    item_data_record['table_t3_data'].append([doc_action["author"], doc_action["responsible_person"], doc_action["task"], format_date(str(doc_action["due_date"]), scope='day'), format_date(str(doc_action["created_date"]), scope='day'), doc_action["notes"]])
               
                            item_data={**item_data, **item_data_record}
                        
                            processor = OPEXXMLProcessor(template_edocs)
                        else:
                            processor = OPEXXMLProcessor(template_media)
                        success_count, errors = processor.populate_from_dict(item_data)
                        record_level_opex_file_path=os.path.join(ITEM_level_path, f"{record_prefix}.opex")
                        processor.save(record_level_opex_file_path)
                        complete_folder_size+=os.path.getsize(record_level_opex_file_path)
                        
                        #print(f"Aizpildīti {success_count} lauki")
                        if errors:
                            print(f"Errors: {errors}")
                data.append(str(inventory.items_per_period))
    async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_export_finished","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
    async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_zipping_started","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
    print(f"Kopējais eksporta mapei sagatavotā satura apjoms: {format_file_size(complete_folder_size)}")    
    # Zip the export folder
    compression_level = zipfile.ZIP_STORED
    enable_zip64 = True
    try:    
        zip_directory(base_export_path, zip_file_path, compression_level, enable_zip64, complete_folder_size, channel_layer)
        zip_file_name=f"{export_name}.zip"
        async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_zipping_finished","file_name":zip_file_name,"date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
        
        try:
            shutil.rmtree(base_export_path)        
            async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_folder_deleted","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
        except Exception as e:
            async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"deleting_opex_folder_failed","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
            
    except Exception as e:
        async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"project","status":"opex_zipping_failed","date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})
    

def zip_directory(directory_path, zip_path, compression_level=zipfile.ZIP_DEFLATED, enable_zip64=True, estimated_total_size=None, channel_layer=None):
    base_dir = os.path.basename(os.path.normpath(directory_path))
    zipped_size = 0
    with zipfile.ZipFile(zip_path, 'w', compression=compression_level, allowZip64=enable_zip64) as zipf:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_size = os.path.getsize(file_path)
                zipped_size += file_size
                progress=round((zipped_size/estimated_total_size*100),0) if estimated_total_size>0 else 0
                
                rel_path = os.path.relpath(file_path, directory_path)
                arcname = os.path.join(base_dir, rel_path)

                zipf.write(file_path, arcname=arcname)
                if channel_layer is not None:
                    async_to_sync(channel_layer.group_send)(OPEX_PROGRESS_GROUP_NAME,{"type": SEND_TYPE_PROGRESS,"data": {"msg_level":"opex_zipping_progress","status":progress,"date":datetime.now().strftime("%Y-%m-%d"), "time":datetime.now().strftime("%H:%M:%S")}})

#################################################################################

def create_folder_level_opex(template_path, output_path, title, description, security_descriptor):
    """
    Load OPEX XML template, fill specified fields, and save to new location.

    Args:
        template_path (str): Path to the XML template file
        output_path (str): Path where the filled XML should be saved
        title (str): Title to insert
        description (str): Description to insert
        security_descriptor (str): Security descriptor to insert

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Parse the XML template
        tree = ET.parse(template_path)
        root = tree.getroot()

        # Find the Properties element
        properties = root.find('Properties')
        if properties is None:
            raise ValueError("Properties element not found in XML")

        # Fill the specified fields
        title_elem = properties.find('Title')
        if title_elem is not None:
            title_elem.text = title
        else:
            title_elem = ET.SubElement(properties, 'Title')
            title_elem.text = title

        description_elem = properties.find('Description')
        if description_elem is not None:
            description_elem.text = description
        else:
            description_elem = ET.SubElement(properties, 'Description')
            description_elem.text = description

        security_elem = properties.find('SecurityDescriptor')
        if security_elem is not None:
            security_elem.text = security_descriptor
        else:
            security_elem = ET.SubElement(properties, 'SecurityDescriptor')
            security_elem.text = security_descriptor

        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Save the filled XML to new location
        tree.write(output_path, encoding='utf-8', xml_declaration=True)

        print(f"Successfully created filled XML at: {output_path}")
        return True

    except Exception as e:
        print(f"Error processing XML: {e}")
        return False

def export_inventories_to_docx(project_id=1, electronic_only=True):
    """ Export inventories to DOCX files, one for electronic and one for paper inventories.
    The function fills in the fields in the template and creates a table with inventory data.
    The final DOCX files are saved in the output_path_final_# folder.
    Args:
    project_id (int): ID of the project to export
    electronic_only (bool): If True, export only electronic inventories, else only paper inventories.
    
    Returns:
    (str,str): Text, Path to the saved DOCX file, or raises ValidationError if no inventories found.
    
    """
    templates_path=os.path.join(settings.BASE_DIR,"project","helpers","utils","doc_templates")
    template_path_1 = os.path.join(templates_path,"1_akts_aprakstitu_papira-dok_nodosana_pienemsana_TEMPL.docx")
    template_path_2 = os.path.join(templates_path,"2_akts_aprakstitu_elektonisko-dok_nodosana_pienemsana_TEMPL.docx")

    datetime_str=datetime.now().strftime("%Y.%m.%d_%H_%M_%S")
    inst_objects=Institution.objects.filter(project__id=project_id)
    institution=inst_objects.first()
    project=institution.project
    project_folder=project.folder
    output_path_tmp1 = os.path.join(project_folder,"tmp_filled_1_pn.docx")
    output_path_tmp2 = os.path.join(project_folder,"tmp_filled_2_pn.docx")
    output_path_final_1 = os.path.join(project_folder,f"1_akts_aprakstitu_papira-dok_nod-pien_{datetime_str}.docx")
    output_path_final_2 = os.path.join(project_folder,f"2_akts_aprakstitu_elektonisko-dok_nod-pien_{datetime_str}.docx")
    
    fond_object=Fond.objects.filter(institution=institution)
    inventories=Inventory.objects.filter(fond__in=fond_object)
    data=[]   
    item_count=0 
    for inventory in inventories:

        subfond=str(inventory.subfond) if len(str(inventory.subfond)) > 0  else ""
        US_type_text="Nav norādīts"
        if inventory.type == "Tekstuāls" and inventory.electronic==True:
            US_type_text="Tekstuālie dokumenti elektroniskā formā"
        elif inventory.type == "Tekstuāls" and inventory.electronic==False:
            US_type_text="Tekstuālie dokumenti papīra formā"            
        elif inventory.type in INVENTORY_MEDIA_TYPE and inventory.electronic==True:
            US_type_text=f"{inventory.type} dokumenti elektroniskā formā"
        elif inventory.type in INVENTORY_MEDIA_TYPE and inventory.electronic==False:
            US_type_text=f"{inventory.type} dokumenti analogā formā"

        items=inventory.items.all()
        restricted_items=[]
            
        if ((electronic_only==True and inventory.electronic) or (electronic_only==False and not inventory.electronic)) and inventory.items_per_period>0:
            item_count+=inventory.items_per_period
            
            inventory_extensions=set()
            inventory_size_total=0
            
            for item in items:
                apjmv=str(item.unit_of_measure)
                item_file_size_total=0
                                
                if inventory.type=="Tekstuāls" and inventory.electronic==False:
                    apjmv="Lapas"
                if len(str(item.restriction)) != ITEM_RESTRICTION_DEFAULT_VALUE:
                    restricted_items.append(str(item.number))
                if inventory.type == "Foto":
                    item_records=PhotoRecord.objects.filter(item=item)
                elif inventory.type == "Skaņas":
                    item_records=AudioRecord.objects.filter(item=item)
                elif inventory.type == "Video":
                    item_records=VideoRecord.objects.filter(item=item)
                else:
                    item_records=Record.objects.filter(item=item)  
                
                filenames=[]                
                extensions_set = set()
                for record in item_records:
                    for file in record.files.all():
                        item_file_size_total += int(file.size)
                        filename = os.path.basename(file.path)
                        filenames.append(filename)
                        ext = os.path.splitext(filename)[1][1:].lower()
                        if ext:
                            extensions_set.add(ext)

                unique_extensions = sorted(list(extensions_set))
                inventory_extensions.update(unique_extensions)
                inventory_size_total += item_file_size_total
            
                    
            apj,apjmv=format_file_size(int(inventory_size_total))
            if inventory.type=="Tekstuāls" and inventory.electronic==False:
                apjmv="Lapas"
                apj=str(inventory_size_total)
            
            
            vienibas_kopa_vardiem=convert_to_feminine(number_to_latvian(item_count))
            gads_no,gads_lidz="",""
            if inventory.end_date  is not None and inventory.end_date != '':
                gads_lidz=format_date(str(inventory.end_date), scope='year')
                
            if inventory.start_date  is not None and inventory.start_date != '':
                gads_no=format_date(str(inventory.start_date), scope='year')
            
            periods=gads_no if gads_no==gads_lidz else f"{gads_no}—{gads_lidz}"
            ierobezoti_gv=", ".join(restricted_items)
            fields = {
                "akta_reg_nr": "", # tukšs šobrīd
                "lna_dok_reg_nr": "", #arī tukšs
                "nod_pamatojums": "", #nāks no UI
                "inst_nosaukums": institution.name, # no institūcijas
                "inst_reg_nr": institution.reg_nr, # no institūcijas
                "inst_jurid_addr": "",#tukšs
                "inst_atbild_pers" : f"{institution.signer_position} {institution.signer}", #signer no institūcijas
                "lna_strukturvieniba" : fond_object[0].arch_title, #arch title no fonda
                "lna_atbild" : "", # tukšs
                "lna_fonda_nr" : str(fond_object[0].fond_number), # fonda nr no fonda
                "lna_fonda_nosaukums" : fond_object[0].fond_title, # no fonda
                "periods" : periods,  # no inventāra tikai elektroniskajiem (papīrs ir otrs template)
                "gv_skaits_cip_vardos" : f"{str(item_count)} ({vienibas_kopa_vardiem})",
                "lna_parb_veica" : "", #tukšs
                "nodeva_amats_vards" : f"{institution.signer_position} {institution.signer}", #signer no institūcijas
                "tabula_par_us": "{TABULAS_VIETA}"
            }

            inventory_extensions = sorted(list(inventory_extensions))
            apj_str=f"{apj} {apjmv}"
            US_str=f"{inventory.number}. uzskaites saraksts, {US_type_text}"
            extensions_str = ", ".join(inventory_extensions)
            data.append((US_str,str(inventory.items_per_period), str(inventory.items_per_period), apj_str, extensions_str, ierobezoti_gv))
            
        
    if(len(data)>0):
        
        template_path=template_path_1
        output_path=output_path_tmp1
        output_path_final=output_path_final_1
        
        if electronic_only==True:
            template_path=template_path_2
            output_path=output_path_tmp2
            output_path_final=output_path_final_2


        # Open the template and merge the fields
        with MailMerge(template_path) as document:
            document.merge(**fields)
            document.write(output_path)
        saved_docx_path=replace_placeholder_with_table_and_save_docx(output_path, output_path_final, data, electronic_only)
        
        if os.path.exists(output_path):
            os.remove(output_path)
        return f"izveidots DOCX fails: {saved_docx_path}", saved_docx_path
    else: raise ValidationError("Kļūda: Nav atrastas glabājamās vienības atbilstoši izvēlētajiem kritērijiem.")
     

def insert_table_after_paragraph(paragraph, data, doc, electronic):
    """ Utility: Insert a table after a specific paragraph in a docx document object.
    Args:
    paragraph (docx.text.paragraph.Paragraph): The paragraph after which to insert the table
    data (list): List of tuples with data to fill the table
    doc (docx.document.Document): The document object
    electronic (bool): If True, use electronic inventory table format, else paper inventory format
    
    Returns:
    docx.oxml.table.CT_Table: The inserted table object
    """
    columns=6
    if electronic==False:
        columns=3
    tbl = doc.add_table(rows=1, cols=columns)
    tbl.style = 'Table Grid'
    hdr_cells = tbl.rows[0].cells
    hdr_cells[0].text = 'Uzskaites saraksta veids, nosaukums un numurs'
    hdr_cells[1].text = 'Glabājamo vienību skaits uzskaites sarakstā'
    if electronic==True:
        hdr_cells[2].text = 'Dokumentu skaits'
        hdr_cells[3].text = 'Datu apjoms'
        hdr_cells[4].text = 'Datnes formāts'
        hdr_cells[5].text = 'Glabājamo vienību ar ierobežotu pieejamību numuri'
    else:
        hdr_cells[2].text = 'Glabājamo vienību ar ierobežotu pieejamību numuri'        
        
    for usn, gvsk,doksk,datapj,datnf,gviepnr in data:
        row_cells = tbl.add_row().cells
        row_cells[0].text = usn
        row_cells[1].text = gvsk
        if electronic==True:
            row_cells[2].text = doksk
            row_cells[3].text = datapj
            row_cells[4].text = datnf
            row_cells[5].text = gviepnr
        else: 
            row_cells[2].text = gviepnr
    table, p = tbl._tbl, paragraph._p
    p.addnext(table)
    return table
    

def replace_placeholder_with_table_and_save_docx(input_path, output_path, data, electronic):
    """ Utility: Replace a placeholder in a docx document with a table and save the document.
    args:
    input_path (str): Path to the input docx file
    output_path (str): Path to save the modified docx file
    data (list): List of tuples with data to fill the table
    electronic (bool): If True, use electronic inventory table format, else paper inventory format
    
    Returns:
    str: Path to the saved docx file
    """
    doc = Document(input_path)
    # Replace in paragraphs
    for paragraph in doc.paragraphs:
        if "{TABULAS_VIETA}" in paragraph.text:
            insert_table_after_paragraph(paragraph, data, doc, electronic)
            # Safely remove a paragraph from the document
            p = paragraph._element
            p.getparent().remove(p)
            paragraph._p = paragraph._element = None
    # Replace in table cells (handling all paragraphs in cells)
    doc.save(output_path)
    print(f"Saved docx: {output_path}")
    return output_path

#################################################################################


            
def export_inventories_to_xlsx(project_id=1):
    """Export inventories to XLSX files, one per inventory, and merge them into a single XLSX workbook with multiple sheets as inventories.
    The function fills in the fields in the template and creates a table with inventory data.
    The final XLSX file is saved in the defined folder.
    
    Args:
    project_id (int): ID of the project to export
    
    Returns:
    str,str: Text,Path to the saved XLSX file, or raises ValidationError if no inventories found.
    
    """
    templates_path=os.path.join(settings.BASE_DIR,"project","helpers","utils","doc_templates")
    inst_objects=Institution.objects.filter(project__id=project_id)
    institution=inst_objects.first()
    
    project=institution.project
    project_folder=project.folder
    
    
    fond_object=Fond.objects.filter(institution=institution).first()
    if fond_object:
        inventories=Inventory.objects.filter(fond=fond_object)
        
        files_to_merge=[]
        for inventory in inventories:
            # Load the workbook and worksheet
            if inventory.items_per_period>0:
            
                wb_path=os.path.join(templates_path,"US_template_media.xlsx")
                if os.path.exists(wb_path)==False:
                    print(f"Nevarēja atrast XLSX veidni: {wb_path}")
                    raise ValidationError(f"Nevarēja atrast XLSX veidni: {wb_path}")
                wb = load_workbook(wb_path)
                ws = wb.active
                
                # Template row number (1-based) to be duplicated with data // rinda, kurā ir aizpildāmie lauki
                template_row_num = 10
                
                subfond=str(inventory.subfond) if len(str(inventory.subfond)) > 0  else ""
                
                US_type_text="Nav norādīts"
                if inventory.type == "Tekstuāls" and inventory.electronic==True:
                    US_type_text="Tekstuālie dokumenti elektroniskā formā"
                elif inventory.type == "Tekstuāls" and inventory.electronic==False:
                    US_type_text="Tekstuālie dokumenti papīra formā"            
                elif inventory.type in INVENTORY_MEDIA_TYPE and inventory.electronic==True:
                    US_type_text=f"{inventory.type} dokumenti elektroniskā formā"
                elif inventory.type in INVENTORY_MEDIA_TYPE and inventory.electronic==False:
                    US_type_text=f"{inventory.type} dokumenti analogā formā"
                item_count_total=inventory.total_items
                items=inventory.items.all()

                data=[]    
                inv_nrs=[]
                item_count=0

                for item in items:
                    apjmv=str(item.unit_of_measure)
                    if inventory.type=="Tekstuāls" and inventory.electronic==False:
                        apjmv="Lapas"
                    restriction_elements=[str(item.restriction), str(item.restriction_note)]
                    restriction_notes = ' '.join([r for r in restriction_elements if len(r) > 1])            
                    item_file_size_total=0
                    
                    if inventory.type == "Foto":
                        item_records=PhotoRecord.objects.filter(item=item)
                    elif inventory.type == "Skaņas":
                        item_records=AudioRecord.objects.filter(item=item)
                    elif inventory.type == "Video":
                        item_records=VideoRecord.objects.filter(item=item)
                    else:
                        item_records=Record.objects.filter(item=item)  
                    
                    filenames=[]                
                    for record in item_records:
                        for file in record.files.all():
                            filenames.append(os.path.basename(file.path))
                            item_file_size_total += int(file.size)
                        
                    apj,apjmv=format_file_size(int(item_file_size_total))
                    if inventory.type=="Tekstuāls" and inventory.electronic==False:
                        apjmv="Lapas"
                        apj=str(item.size)
                    
                    related_items=[]
                    for related in item.related_item.all():
                        #print(f"Related Item: {related.title} (ID: {related.id})")
                        related_items.append(f"{related.inventory.number}-{related.number}")
                    related_str=", ".join(related_items)

                    notes=", ".join(filenames)
                    notes=notes+" "+item.notes if len(item.notes) > 1 else ""

                    data.append({
                        "{afuk}": subfond,
                        "{saluk}": str(item.series_code),                                
                        "{gvnpk}": str(item.number),
                        "{gvdn}": format_date(str(item.start_date),scope=item.date_indicator),
                        "{gvdl}": format_date(str(item.end_date),scope=item.date_indicator),
                        "{dp}": str(item.date_note),
                        "{apj}": str(apj),
                        "{apjmv}": apjmv,
                        "{sav}": related_str,
                        "{gvnos}": item.title,
                        "{piez}": notes.strip(),
                        "{sat}": item.annotation if len(item.annotation) > 1 else "",
                        "{sist}": item.sistematisation if len(item.sistematisation) > 1 else "",
                        "{valoda}": item.language,
                        "{pie}": restriction_notes,
                        "{fr}": US_type_text,
                        "{slep}": item.security_level,
                        "{kop}": item.copy if len(item.copy) > 1 else "",
                        "{arh_vert}": item.archival_history if len(item.archival_history) > 1 else "",
                    })
                    inv_nrs.append(item.number)
                    item_count+=1
                        

                # Extract the template row
                template_row = list(ws.iter_rows(min_row=template_row_num, max_row=template_row_num))[0]

                # Start inserting rows below the template
                insert_start = template_row_num + 1

                for idx, entry in enumerate(data):
                    target_row_num = insert_start + idx

                    # Insert a new row
                    ws.insert_rows(target_row_num)

                    for col_idx, cell in enumerate(template_row, start=1):
                        new_cell = ws.cell(row=target_row_num, column=col_idx)

                        # Copy value, formatting, etc.
                        new_cell.value = cell.value
                        if isinstance(cell.value, str):
                            for key, val in entry.items():
                                if key in new_cell.value:
                                    new_cell.value = new_cell.value.replace(key, val)

                        # Copy formatting
                        new_cell.font = copy(cell.font)
                        new_cell.border = copy(cell.border)
                        new_cell.fill = copy(cell.fill)
                        new_cell.number_format = copy(cell.number_format)
                        new_cell.protection = copy(cell.protection)
                        new_cell.alignment = copy(cell.alignment)

                # Optionally delete the original template row
                ws.delete_rows(template_row_num)
            
                vienibas_kopa_vardiem=convert_to_feminine(number_to_latvian(item_count_total))

                gads_no,gads_lidz="",""
                if inventory.end_date  is not None and inventory.end_date != '':
                    gads_lidz=format_date(str(inventory.end_date), scope='year')
                if inventory.start_date  is not None and inventory.start_date != '':
                    gads_no=format_date(str(inventory.start_date), scope='year')
                
                periods=gads_no if gads_no==gads_lidz else f"{gads_no}—{gads_lidz}"
                fonda_nr=str(inventory.fond.fond_number)
                arhivs=str(inventory.fond.arch_abbreviation)
                current_us_items=len(inv_nrs)
                fonda_nosaukums=str(inventory.fond.fond_title)
                gv_skaits_vardiem=convert_to_feminine(number_to_latvian(current_us_items))        
                # Dictionary of replacements
                replacements = {
                    '{arhiva_abr}': arhivs,
                    '{fonda_nr}': fonda_nr,
                    '{fonda_nosaukums}': fonda_nosaukums,
                    '{us_nr}': str(inventory.number),
                    '{us_glab_term}': str(inventory.storage_term),
                    '{us_periods}': periods,
                    '{us_nesejs}': US_type_text,
                    '{gv_skaits}': str(current_us_items),
                    '{gv_nr_no}': str(min(inv_nrs)),
                    '{gv_nr_lidz}': str(max(inv_nrs)),
                    '{vienibas_kopa}': str(item_count_total),
                    '{gv_skaits_vardiem}': gv_skaits_vardiem,
                    '{vienibas_kopa_vardiem}': vienibas_kopa_vardiem,
                    '{parakstitajs}': str(institution.signer),
                    '{par_amats}': str(institution.signer_position),
                    '{izstradatajs}': str(institution.creator),
                    '{izstr_amats}': str(institution.creator_position),            
                    '{litera_nr}': "-",            
                    '{izlaistie_nr}': "-",            
                }
                
                # Iterate through all cells
                for row in ws.iter_rows():
                    for cell in row:
                        if cell.value and isinstance(cell.value, str):
                            for key, val in replacements.items():
                                if key in cell.value:
                                    cell.value = cell.value.replace(key, val)
                # Save to a new file
                US_NR=str(inventory.number)
                output_path_us = os.path.join(project_folder, f"{US_NR}.US.xlsx")
                
                wb.save(output_path_us)
                files_to_merge.append(output_path_us)
            
        if len(files_to_merge)>0:
            datetime_str=datetime.now().strftime("%Y.%m.%d_%H_%M_%S")
            # Merge all generated files into one workbook with multiple sheets
            filename_exported=f"F{fonda_nr}_{periods}g_{datetime_str}.xlsx"
            exported_xlsx_path=os.path.join(project_folder,filename_exported)
            merge_workbooks(files_to_merge, project_folder, filename_exported, copy_values_only=False)
            
            # Clean up temporary files
            for filename in files_to_merge:
                file_path = os.path.join(project_folder, filename)
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        print(f"Nevarēja izdzēst pagaidu US dokumentu {file_path}: {e}")
                else:
                    print(f"Nevarēja atrast pagaidu US dokumentu: {file_path}")
            
            return f"izveidots XLSX fails: {exported_xlsx_path}", exported_xlsx_path
        else:
            raise ValidationError("Kļūda: Nav atrastas glabājamās vienības atbilstoši izvēlētajiem kritērijiem.")


def merge_workbooks(files, work_path, output_filename="merged.xlsx", copy_values_only=True):
    """
    Merge the first sheet of each workbook into a new workbook.
    
    Args:
        files (list): List of xlsx file names (without path).
        work_path (str): Path where files are located.
        output_filename (str): Name of the merged output file.
        copy_values_only (bool): If False, also copy formatting/styles.
       
    Returns:
        None: Saves the merged workbook to the specified output path.
         
    Example:
        Copy only values
        merge_workbooks(files, work_path, "merged_values_only.xlsx", copy_values_only=True)

        Copy values + formatting/styles
        merge_workbooks(files, work_path, "merged_with_styles.xlsx", copy_values_only=False)
    """
    
    merged_wb = Workbook()
    # Remove the default sheet created by Workbook()
    default_sheet = merged_wb.active
    merged_wb.remove(default_sheet)

    if len(files) > 0:
        for file in files:
            full_path = os.path.join(work_path, file)

            src_wb = load_workbook(full_path)
            src_sheet = src_wb.worksheets[0]  # first sheet

            # Create a new sheet named after the file (without .xlsx)
            sheet_name = os.path.splitext(os.path.basename(file))[0]
            print(f"Merging sheet: {sheet_name} from file: {file}")
            new_sheet = merged_wb.create_sheet(title=sheet_name)

            for row in src_sheet.iter_rows():
                for cell in row:
                    new_cell = new_sheet[cell.coordinate]
                    new_cell.value = cell.value

                    if not copy_values_only:
                        if cell.has_style:
                            new_cell.font = copy(cell.font)
                            new_cell.border = copy(cell.border)
                            new_cell.fill = copy(cell.fill)
                            new_cell.number_format = cell.number_format
                            new_cell.protection = copy(cell.protection)
                            new_cell.alignment = copy(cell.alignment)

            # Copy column widths
            if not copy_values_only:
                for col_letter, dim in src_sheet.column_dimensions.items():
                    new_sheet.column_dimensions[col_letter].width = dim.width

                # Copy row heights
                for row_idx, dim in src_sheet.row_dimensions.items():
                    new_sheet.row_dimensions[row_idx].height = dim.height

        # Save result
        output_file = os.path.join(work_path, output_filename)
        merged_wb.save(output_file)
        print(f"Merged file saved as: {output_file}")
        return output_file
    else:
        print("No workbooks to merge.")
        return None

def create_folder_level_opex(template_path, output_path, title, description, security_descriptor):
    """
    Load OPEX XML template, fill specified fields, and save to new location.

    Args:
        template_path (str): Path to the XML template file
        output_path (str): Path where the filled XML should be saved
        title (str): Title to insert
        description (str): Description to insert
        security_descriptor (str): Security descriptor to insert

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Parse the XML template
        tree = ET.parse(template_path)
        root = tree.getroot()

        # Find the Properties element
        properties = root.find('Properties')
        if properties is None:
            raise ValueError("Properties element not found in XML")

        # Fill the specified fields
        title_elem = properties.find('Title')
        if title_elem is not None:
            title_elem.text = title
        else:
            title_elem = ET.SubElement(properties, 'Title')
            title_elem.text = title

        description_elem = properties.find('Description')
        if description_elem is not None:
            description_elem.text = description
        else:
            description_elem = ET.SubElement(properties, 'Description')
            description_elem.text = description

        security_elem = properties.find('SecurityDescriptor')
        if security_elem is not None:
            security_elem.text = security_descriptor
        else:
            security_elem = ET.SubElement(properties, 'SecurityDescriptor')
            security_elem.text = security_descriptor

        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Save the filled XML to new location
        tree.write(output_path, encoding='utf-8', xml_declaration=True)

        print(f"Successfully created filled XML at: {output_path}")
        return True

    except Exception as e:
        print(f"Error processing XML: {e}")
        return False


def format_date(date_str, scope='day'):
    """ Format date string from 'YYYY-MM-DD' to 'DD.MM.YYYY.' or 'MM.YYYY.' or 'YYYY.' based on scope.
    Args:
    date_str (str): Date string in 'YYYY-MM-DD' format
    scope (str): 'day' for 'DD.MM.YYYY.', 'month' for 'MM.YYYY.', 'year' for 'YYYY.'
    
    Returns:
    str: Formatted date string
    """
    parts = date_str.split('-')
    if len(parts) != 3:
        raise ValidationError("Date string must be in 'YYYY-MM-DD' format")
    else:

        if scope == 'month':
            # "07.2015."
            return f"{parts[1]}.{parts[0]}."
        elif scope == 'year':
            # "2015."
            return f"{parts[0]}."
        else:
            # we use scope "day as default, e.g. "15.07.2015."
            return f"{parts[2]}.{parts[1]}.{parts[0]}."
    
def format_file_size(size_bytes):
    """ Convert file size in bytes to a human-readable format with appropriate unit.
    Args:
    size_bytes (int): File size in bytes
    Returns:
    tuple: (size_str, unit) where size_str is the size formatted with 2 decimal places and comma as decimal separator, and unit is one of B, KB, MB, GB, TB, PB, EB
    """
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']
    size = float(size_bytes)
    unit_index = 0

    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1

    # Format with 2 decimal places and replace dot with comma
    size_str = f"{size:.2f}".replace('.', ',')
    return size_str, units[unit_index]