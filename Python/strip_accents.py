import unicodedata
import string

# Small utility that removes punctuation marks and accents.
# Sources:
# http://stackoverflow.com/questions/517923/what-is-the-best-way-to-remove-accents-in-a-python-unicode-string
# http://stackoverflow.com/questions/265960/best-way-to-strip-punctuation-from-a-string-in-python

table = string.maketrans("","")
def strip_accents(s):
	s = s.translate(table, string.punctuation)
	s = unicode(s.decode('utf-8'))
   	return (''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn')).encode('ascii', 'ignore').lower()