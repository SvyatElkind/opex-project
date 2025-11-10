def number_to_latvian(n):

    # Input validation
    if not isinstance(n, (int, float)):
        raise TypeError("Input must be an integer")

    if isinstance(n, float):
        if not n.is_integer():
            raise ValueError("Float input must represent a whole number")
        n = int(n)

    if n < 0:
        raise ValueError("Negative numbers are not supported")

    if n > 999999999:
        raise ValueError("Numbers larger than 999,999,999 are not supported")

    # Special case for zero
    if n == 0:
        return "nulle"

    # Basic numbers 0-19
    ones = [
        "", "viens", "divi", "trīs", "četri", "pieci", 
        "seši", "septiņi", "astoņi", "deviņi", "desmit",
        "vienpadsmit", "divpadsmit", "trīspadsmit", "četrpadsmit", "piecpadsmit",
        "sešpadsmit", "septiņpadsmit", "astoņpadsmit", "deviņpadsmit"
    ]

    # Tens (20, 30, 40, etc.)
    tens = [
        "", "", "divdesmit", "trīsdesmit", "četrdesmit", "piecdesmit",
        "sešdesmit", "septiņdesmit", "astoņdesmit", "deviņdesmit"
    ]

    def convert_hundreds(num):
        """Convert a number from 1-999 to Latvian text"""
        result = []

        # Handle hundreds
        if num >= 100:
            h = num // 100
            remainder = num % 100

            if h == 1:
                if remainder == 0:
                    result.append("viens simts")  # exactly 100
                else:
                    result.append("simtu")  # 101-199 (special genitive form)
            else:
                # 200-900 - use plural form "simti"
                result.append(f"{ones[h]} simti")

            num %= 100

        # Handle tens and ones
        if num >= 20:
            t = num // 10
            result.append(tens[t])
            num %= 10
            if num > 0:
                result.append(ones[num])
        elif num > 0:
            result.append(ones[num])

        return " ".join(result)

    def get_thousand_form(count):
        """Get the correct form of 'thousand' based on grammatical rules"""
        # tūkstotis (singular) vs tūkstoši (plural)
        # Rule: use singular for 1, and numbers ending in 1 (except 11)
        if count == 1:
            return "tūkstotis"
        elif count % 10 == 1 and count % 100 != 11:
            return "tūkstotis"  # 21, 31, 41, etc. but not 11
        else:
            return "tūkstoši"

    def get_million_form(count):
        """Get the correct form of 'million' based on grammatical rules"""
        if count == 1:
            return "miljons"
        else:
            return "miljoni"

    result = []

    # Handle millions
    if n >= 1000000:
        millions = n // 1000000
        result.append(convert_hundreds(millions))
        result.append(get_million_form(millions))
        n %= 1000000

    # Handle thousands
    if n >= 1000:
        thousands = n // 1000
        thousands_text = convert_hundreds(thousands)
        result.append(thousands_text)
        result.append(get_thousand_form(thousands))
        n %= 1000

    # Handle remainder (hundreds, tens, ones)
    if n > 0:
        remainder_text = convert_hundreds(n)
        result.append(remainder_text)

    return " ".join(result)

def convert_to_feminine(latvian_number_text):
    """Convert masculine form to feminine form"""
    # Mapping for numbers 1-9 only
    masculine_to_feminine = {
        "viens": "viena",      # 1
        "divi": "divas",       # 2 
        "trīs": "trīs",        # 3 (same for both genders)
        "četri": "četras",     # 4
        "pieci": "piecas",     # 5
        "seši": "sešas",       # 6
        "septiņi": "septiņas", # 7
        "astoņi": "astoņas",   # 8
        "deviņi": "deviņas"    # 9
    }
    
    words = latvian_number_text.split()
    if words and words[-1] in masculine_to_feminine:
        words[-1] = masculine_to_feminine[words[-1]]
    
    return " ".join(words)
