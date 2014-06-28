# script to apply the crop function to every image in the folder.
for fig in $(ls Results/Fig/*.eps)
do
	bash Results/Fig/crop.sh $fig
done