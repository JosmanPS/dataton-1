#main.py
import sys
import json
from strip_accents import *

def main():
	tweet_file = open(sys.argv[1])
	dict_file  = open(sys.argv[2])

	# Construct the original scores' dictionary.
	scores = {}
	for line in dict_file:
		try:
			term, score  = line.split("\t")
			scores[term] = float(score)
		except:
			pass

	newWords = {}

	# For every tweet do the following:
	# Step 1. Calculate scores according to the current dictionary.
	# Step 2. If the tweet was given a score, print the coordinates and the score.

	for line in tweet_file:
		jline = json.loads(line)
		try:
			text  = jline["text"]
			words = text.split(" ")
			words = [strip_accents(word.encode('ascii', 'ignore')) for word in words]

		except:
			words = []

		score = 0.0
		cont  = 0.0

		for word in words:
			if word in scores.keys():
				score += scores[word]
				cont  += 1.0

		if cont > 0:
			# Step 2. Location and score are printed.
			try:
				if jline["place"]["country_code"] == 'MX':
					text = jline["text"]
					x,y = jline["geo"]["coordinates"]
					print y, ",", x, ",", score
			except:
				pass

if __name__ == '__main__':
	main()
