from inventories.models import Inventory
from items.models import Item
from test_helpers.test_helpers import create_test_items, create_test_items_from_structure, set_up_data_for_inventory_model_test, test_institution, test_inventory, test_project


items1 = {
            "series_code": "1.2",
            "number": 56,
            "title": "Sarakstes dokumenti",
            "start_date": "2012-01-01",
            "end_date": "2012-01-30",
            "size": 50.5,
            "unit_of_measure": "MB",
            "notes": "manas piezīmes",
            "language": "latviešu, vācu",
            "restriction": "Vispārēja",
            "security_level": "Publisks",
            'annotation': "test",
            "color": 'melnbaltā',
            # 'related_item': [2]
            }

items2 = {
            "series_code": "1.2",
            "number": 57,
            "title": "Sarakstes dokumenti",
            "start_date": "2012-01-01",
            "end_date": "2012-01-30",
            "size": 50.5,
            "unit_of_measure": "MB",
            "notes": "manas piezīmes",
            "language": "latviešu, vācu",
            "restriction": "Vispārēja",
            "security_level": "Publisks",
            'annotation': "test",
            "color": 'melnbaltā',
            'related_item': [1]
            }

project, institution, fond = set_up_data_for_inventory_model_test()
inventory = test_inventory(fond)
# items = create_test_items(inventory)
Item.add_item(items1, inventory)
Item.add_item(items2, inventory)


def result():   
    print(project)
    print(institution)
    print(fond)
    print(inventory)



