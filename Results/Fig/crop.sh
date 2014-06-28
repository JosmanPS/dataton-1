#!/bin/bash
# Correct the bounding box of a ps or eps file

# Modified from:
# http://cseweb.ucsd.edu/~s1pan/download/crop
# Shengjun Pan 2010

bb=$(gs -sDEVICE=bbox -dNOPAUSE -dBATCH $1 2>&1 | grep ^%%B)
bbh=$(gs -sDEVICE=bbox -dNOPAUSE -dBATCH $1 2>&1 | grep ^%%H)

sed s/^%%BoundingBox:.*$/"$bb"/ <$1\
| sed s/^%%HiResBoundingBox:.*$/"$bbh"/\
> "${1%.*}_bb.${1##*.}"

mv "${1%.*}_bb.${1##*.}" "${1%.*}.${1##*.}"
