"""Module conatins composer functions for API responses
 related to project app."""

def compose_project_data(project) -> dict:
    """Compose project data.
    
    Args:
        project: Project instance.
    
    Returns:
        Dictionary with project data.
    """
    # Compose project data
    project_data  = {
        'project': {
            'id': project.id,
            'name': project.name,
            'created_at': project.created_at,
            'validated': project.validated,
        }
    }

    return project_data


def compose_institution_data(institution) -> dict:
    """Compose institution data.
    
    Args:
        project: Institution instance.
    
    Returns:
        Dictionary with institution data.
    """
    # Compose institution data.
    institution_data = {
        'id': institution.id,
        'reg_nr': institution.reg_nr,
        'name': institution.name,
        'creator': institution.creator,
        'creator_position': institution.creator_position,
        'signer': institution.signer,
        'signer_position': institution.signer_position
    }

    return institution_data


def compose_fond_data(fond) -> dict:
    """Compose fond data.
    
    Args:
        project: Fond instance.
    
    Returns:
        Dictionary with fond data
    """
    # Compose fond data.
    fond_data = {
        'id': fond.id,
        'fond_code': fond.fond_code,
        'arch_abbreviation': fond.arch_abbreviation,
        'arch_title': fond.arch_title,
        'fond_number': fond.fond_number,
        'fond_title': fond.fond_title,
        'subfond': fond.subfond,
    }

    return fond_data


def compose_item_data(inventory) -> list:
    """Compose item data.
    
    Args:
        project: Inventory instance.
    
    Returns:
        List with item data
    """
    # Create list for items
    item_list = []
    for item in inventory.items.all():
        item_object = {
            'id': item.id,
            'item_series_code': item.item_series_code,
            'item_number': item.item_number,
            'item_title': item.item_title,
            'item_start_date': item.item_start_date,
            'item_end_date': item.item_end_date,
            'item_date_note': item.item_date_note,
            'item_size': item.item_size,
            'item_unit_of_measure': item.item_unit_of_measure,
            'item_notes': item.item_notes,
            'item_annotation': item.item_annotation,
            'item_sistematisation': item.item_sistematisation,
            'item_physical_description': item.item_physical_description,
            'item_language': item.item_language,
            'item_restriction': item.item_restriction,
            'item_security_level': item.item_security_level,
            'item_copy': item.item_copy,
            'item_archival_history': item.item_archival_history
        }

        # TODO check related items
        if not hasattr(item, 'related_item'):
            item_object['related_item'] = None
        else:
            item_object['related_item'] = 1

        item_list.append(item_object)
    
    return item_list


def compose_inventory_data(fond) -> list:
    """Compose inventories data.
    
    Args:
        project: Fond instance.
    
    Returns:
        List with inventories data
    """
    # Create list for inventories
    inventory_list = []
    for inventory in fond.inventories.all():

        inventory_object = {
            'id': inventory.id,
            'number': inventory.number,
            'postfix': inventory.postfix,
            'type': inventory.type,
            'electronic': inventory.electronic,
            'last_gv': inventory.last_gv,
            'start_date': inventory.start_date,
            'end_date': inventory.end_date,
            'storage_term': inventory.storage_term,
            'items_per_period': inventory.items_per_period,
            'total_items': inventory.total_items,
            'items': None
        }

        if hasattr(inventory, 'items'):
            items_data = compose_item_data(inventory)
            inventory_object['items'] = items_data
        
        inventory_list.append(inventory_object)

    return inventory_list
     

def compose_all_project_data(project) -> dict:
    """Compose json with all data of specific project.
    
    Args:
        project: Project instance.
    
    Returns:
        Dictionary with all data related to specific project
    """
    # Create data dictionary with project data 
    data = compose_project_data(project)
    
    # Add institution data if institution exists
    if not hasattr(project, 'institution'):
        return data
    institution = project.institution
    data['project']['institution'] = compose_institution_data(institution)

    # Add fond data if fond exists
    if not hasattr(institution, 'fond'):
        return data
    fond = institution.fond
    data['project']['fond'] = compose_fond_data(fond)
   
    # Add inventory data if inventory exists
    if not hasattr(fond, 'inventories'):
        return data
    data['project']['fond']['inventory'] = compose_inventory_data(fond)

    return data
