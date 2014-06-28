# File to prepare data.

.PHONY: clean fullclean

Results/Fig/map.eps: R/main.R Results/Data/tweets.csv
	R --slave --vanilla -f R/main.R

Results/Data/coordinates.csv: Python/score_tweets.py Results/Data/tweets.txt Results/Data/dictionary.txt
	python Python/score_tweets.py Results/Data/tweets.txt Results/Data/dictionary.txt > Results/Data/tweets.csv

Results/Data/dictionary.txt: Python/train_dictionary.py Results/Data/tweets.txt Results/Data/spaSent1.txt
	head -n 10000 Results/Data/tweets.txt > Results/Data/tweets.train
	python Python/train_dictionary.py Results/Data/tweets.train Results/Data/spaSent2.txt > Results/Data/dictionary.txt
	rm Results/Data/tweets.train

Results/Data/tweets.txt: Python/collect.py
	python Python/collect.py > Results/Data/tweets.txt

Results/Data/spaSent2.txt: Results/Data/spaSent.txt Python/translate_scores.py
	Python/strip_accents.pyc
Results/Data/spaSent.txt: Results/Data/engSent.txt Python/goslate.py 
	awk '{print $1}' Results/Data/engSent.txt | xargs -L1 echo | python Python/goslate.py -t ES > Results/Data/spaSent.txt

Results/Data/engSent.txt:
	wget https://raw.github.com/uwescience/datasci_course_materials/master/assignment1/AFINN-111.txt
	mv AFINN-111.txt Results/Data/engSent.temp
	sed "s/'//g" Results/Data/engSent.temp > Results/Data/engSent.txt
	rm Results/Data/engSent.temp

Python/goslate.py:
	wget https://bitbucket.org/zhuoqiang/goslate/raw/tip/goslate.py
	mv goslate.py Python/goslate.py

Dashboard/Data/zapopan.geojson:
	wget http://mapserver.inegi.org.mx/MGN/mgm2010v5_0a.zip
	mv mgm2010v5_0a.zip municipios.zip
	unzip municipios
	ogr2ogr -f GeoJSON -t_srs crs:84 -where "CVE_ENT IN ('01')" zapopan.geojson Municipios_2010_5A.shp
	ogr2ogr -f "ESRI Shapefile" -where "CVE_ENT == '09" new_shapefile.shp huge_shapefile.shp

Dashboard/Data/zapopan.geojson

clean:
	rm twitter.aux
	rm twitter.dvi
	rm twitter.log
	rm twitter.out
	rm Rplots.pdf

fullclean:
	rm MEX_adm0.RData
	rm MEX_adm1.RData
	rm Python/goslate.py
	rm Results/Data/*
	rm Results/Table/*
	rm Results/Fig/map.eps
	rm Results/Fig/tweets_location.eps
	make clean