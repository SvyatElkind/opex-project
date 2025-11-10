"""Module for helpers functions in inventories app."""
import os
from datetime import datetime
from copy import copy 
from openpyxl import load_workbook, Workbook
import xml.etree.ElementTree as ET
from mailmerge import MailMerge
from docx import Document
import shutil
from django.core.exceptions import ValidationError
from fonds.models import Fond
from inventories.models import Inventory
from inventories.helpers.constants import INVENTORY_MEDIA_TYPE
from project.helpers.helpers_lv import number_to_latvian, convert_to_feminine
from institutions.models import Institution
from records.models import Record,AudioRecord,PhotoRecord,VideoRecord

#################################################################################


def export_inventories_to_docx(project_id=1, electronic_only=True):
    """ Export inventories to DOCX files, one for electronic and one for paper inventories.
    The function fills in the fields in the template and creates a table with inventory data.
    The final DOCX files are saved in the output_path_final_# folder.
    Args:
    project_id (int): ID of the project to export
    electronic_only (bool): If True, export only electronic inventories, else only paper inventories.
    
    Returns:
    None: Saves the final DOCX files in the defined folder.
    
    """
    template_path_1 = r"./utils/doc_templates/1_akts_aprakstitu_papira-dok_nodosana_pienemsana_TEMPL.docx"
    template_path_2 = r"./utils/doc_templates/2_akts_aprakstitu_elektonisko-dok_nodosana_pienemsana_TEMPL.docx"
    output_path_final_1 = r"./utils/1_akts_aprakstitu_papira-dok_nodosana_pienemsana.docx"
    output_path_final_2 = r"./utils/2_akts_aprakstitu_elektonisko-dok_nodosana_pienemsana.docx"
    output_path_tmp1 = r"./utils/tmp_filled_1_pn.docx"
    output_path_tmp2 = r"./utils/tmp_filled_2_pn.docx"

    inst_objects=Institution.objects.filter(project__id=project_id)
    institution=inst_objects.first()
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
            
        if electronic_only==True and inventory.electronic or electronic_only==False and not inventory.electronic:
            item_count+=inventory.items_per_period
            
            
            for item in items:
                apjmv=str(item.unit_of_measure)
                if inventory.type=="Tekstuāls" and inventory.electronic==False:
                    apjmv="Lapas"
                if str(item.restriction)=="Ierobežotas pieejamības":
                    restricted_items.append(str(item.number))
                item_total_file_size=0
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
                        item_total_file_size+=int(file.size)
                        filenames.append(os.path.basename(file.path))
                        
                    for file in record.files.all():
                        item_total_file_size += int(file.size)
                        filename = os.path.basename(file.path)
                        filenames.append(filename)
                        ext = os.path.splitext(filename)[1][1:].lower()
                        if ext:
                            extensions_set.add(ext)

                unique_extensions = sorted(list(extensions_set))
                    
                apj,apjmv=format_file_size(int(item_total_file_size))
                if inventory.type=="Tekstuāls" and inventory.electronic==False:
                    apjmv="Lapas"
                    apj=str(item.size)
            
            
            vienibas_kopa_vardiem=convert_to_feminine(number_to_latvian(item_count))
            gads_no=format_date(str(inventory.start_date), scope='year')
            gads_lidz=format_date(str(inventory.end_date), scope='year')
            periods=gads_no if gads_no==gads_lidz else f"{gads_no}—{gads_lidz}"
            ierobezoti_gv=", ".join(restricted_items)
            fields = {
                "akta_reg_nr": "", # tukšs šobrīd
                "lna_dok_reg_nr": "", #arī tukšs
                "nod_pamatojums": "", #nāks no UI
                "inst_nosaukums": institution.name, # no institūcijas
                "inst_reg_nr": institution.reg_nr, # no institūcijas
                "inst_jurid_addr": "",#tukšs
                "inst_atbild_pers" : institution.signer, #signer no institūcijas
                "lna_strukturvieniba" : fond_object[0].arch_title, #arch title no fonda
                "lna_atbild" : "", # tukšs
                "lna_fonda_nr" : str(fond_object[0].fond_number), # fonda nr no fonda
                "lna_fonda_nosaukums" : fond_object[0].fond_title, # no fonda
                "periods" : periods,  # no inventāra tikai elektroniskajiem (papīrs ir otrs template)
                "gv_skaits_cip_vardos" : f"{str(item_count)} ({vienibas_kopa_vardiem})",
                "lna_parb_veica" : "", #tukšs
                "nodeva_amats_vards" : institution.signer, #signer no institūcijas
                "tabula_par_us": "{TABULAS_VIETA}"
            }

            apj_str=f"{apj} {apjmv}"
            US_str=f"{inventory.number}. uzskaites saraksts, {US_type_text}"
            extensions_str = ",".join(unique_extensions)
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
        replace_placeholder_with_table_and_save_docx(output_path, output_path_final, data, electronic_only)
        
        if os.path.exists(output_path):
            os.remove(output_path)
            

def insert_table_after_paragraph(paragraph, data, doc, electronic):
    """ Utility: Insert a table after a specific paragraph in a docx document object.
    Args:
    paragraph (docx.text.paragraph.Paragraph): The paragraph after which to insert the table
    data (list): List of tuples with data to fill the table
    doc (docx.document.Document): The document object
    electronic (bool): If True, use electronic inventory table format, else paper inventory format
    
    Returns:
    table (docx.oxml.table.CT_Table): The inserted table object
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
    None: Saves the modified docx file to the specified output path.
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

#################################################################################


            
def export_inventories_to_xlsx(project_id=1):
    """Export inventories to XLSX files, one per inventory, and merge them into a single XLSX workbook with multiple sheets as inventories.
    The function fills in the fields in the template and creates a table with inventory data.
    The final XLSX file is saved in the defined folder.
    
    Args:
    project_id (int): ID of the project to export
    
    Returns:
    None: Saves the final XLSX file in the defined folder.
    
    """
    inst_objects=Institution.objects.filter(project__id=project_id)
    institution=inst_objects.first()
    fond_object=Fond.objects.filter(institution=institution).first()
    if fond_object:
        inventories=Inventory.objects.filter(fond=fond_object)
        
        files_to_merge=[]
        for inventory in inventories:
            # Load the workbook and worksheet
            wb = load_workbook("./utils/doc_templates/US_template_media.xlsx")
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
            item_count=inventory.total_items
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
                item_total_file_size=0
                
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
                        item_total_file_size+=int(file.size)
                        filenames.append(os.path.basename(file.path))
                    
                apj,apjmv=format_file_size(int(item_total_file_size))
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
                print(item)
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
           
            vienibas_kopa_vardiem=convert_to_feminine(number_to_latvian(item_count))
            gads_no=format_date(str(inventory.start_date), scope='year')
            gads_lidz=format_date(str(inventory.end_date), scope='year')
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
                '{vienibas_kopa}': str(item_count),
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
            wb.save(f"./utils/US{US_NR}.xlsx")
            files_to_merge.append(f"US{US_NR}.xlsx")
        
        work_path = r"./utils"
        
        # Merge all generated files into one workbook with multiple sheets
        merge_workbooks(files_to_merge, work_path, f"F{fonda_nr}_{periods}g.xlsx", copy_values_only=False)

        # Clean up temporary files
        for filename in files_to_merge:
            file_path = os.path.join(work_path, filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Nevarēja izdzēst pagaidu US dokumentu {file_path}: {e}")
            else:
                print(f"Nevarēja atrast pagaidu US dokumentu: {file_path}")


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


def merge_workbooks(files, work_path, output_filename="merged.xlsx", copy_values_only=True):
    """
    Merge the first sheet of each workbook into a new workbook.
    
    Args:
        files (list): List of xlsx file names (without path).
        work_path (str): Path where files are located.
        output_filename (str): Name of the merged output file.
        copy_values_only (bool): If False, also copy formatting/styles.
       
    Returns:
        None: Saves the merged workbook to the specified output file.
         
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

    for file in files:
        full_path = os.path.join(work_path, file)

        src_wb = load_workbook(full_path)
        src_sheet = src_wb.worksheets[0]  # first sheet

        # Create a new sheet named after the file (without .xlsx)
        sheet_name = os.path.splitext(file)[0]
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