import sys
import json

def main():
	tweet_file = open(sys.argv[1])
	for line in tweet_file:
		try:
			jline = json.loads(line)
			if jline["place"]["country_code"] == 'MX':
				text = jline["text"]
				x,y = jline["geo"]["coordinates"]
				name = jline["user"]["screen_name"]
				userId = "id" + jline["user"]["id_str"]
				print userId, ", ", name, ", ", y, ", ", x
		except:
			pass
if __name__ == '__main__':
	main()
