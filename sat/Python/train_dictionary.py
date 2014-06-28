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
		term, score  = line.split("\t")
		scores[term] = int(score)

	newWords = {}

	# For every tweet do the following:
	# Step 1. Calculate scores according to the current state of the dictionary.
	# Step 2. Try to improve scores for words that were not manually labelled.

	for line in tweet_file:
		jline = json.loads(line)

		try:
			text  = jline["text"]
			words = text.strip().split(" ")
			words = [strip_accents(word.encode('ascii', 'ignore')) for word in words]

		except:
			words = []

		score = 0.0
		cont  = 0.0

		for word in words:
			# Step 1. Manually scored words are favored.
			if word in scores.keys():
				score += scores[word]
				cont  += 1.0
			elif word in newWords.keys():
				score += newWords[word]
				cont  += 1.0

		if cont > 0:
			# Step 2. Simple update for new words.
			for word in words:
				if word in newWords.keys():
					newWords[word] = .8*newWords[word] + .2*score/cont
				else:
					newWords[word] = score/cont

	for key in scores.keys():
		print key + "\t" + str(scores[key])

	for key in newWords.keys():
		if not key in scores.keys():
			print key + "\t" + str(newWords[key])

if __name__ == '__main__':
	main()
