import sys
import json
from strip_accents import *

def main():
	english_file = open(sys.argv[1])
	spanish_file = open(sys.argv[2])
	scores = {}

	for line in spanish_file:
		line = line.strip()
		term, score = next(english_file).split("\t")

		# For simplicity, avoid phrases and use only words.
		if len(line.split(" ")) == 2:
			word, score2 = line.split(" ")
			scores[ strip_accents(word)] = int(score)

	for key in scores.keys():
		print key + "\t" + str(scores[key])

if __name__ == '__main__':
	main()
