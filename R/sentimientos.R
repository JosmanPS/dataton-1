library(plyr)
library(rjson)
setwd("~/Dropbox/dataton/Dashboard/Data")

toDF = function(json) {
  r = lapply(json, function(x) {
    x[sapply(x, is.null)] <- NA
    unlist(x)
  })
  r = do.call("rbind", r)
  r = as.data.frame(r)
}
fp_edos = file.path(getwd(), "cve_ab_estados.json")
string_edos = paste(readLines(fp_edos), collapse="")
json_edos = fromJSON(string_edos)
data_edos = toDF(json_edos)


sent_path = file.path(getwd(), "sentimientos.json")
sent_string = readLines(sent_path)

sent = fromJSON(sent_string)
data_sent = toDF(sent)
write.table(data.frame(visitas = data_sent$hogar, estado = data_edos$V1 , row.names = NULL), file='sentimientos_hogar.tsv', quote=FALSE, sep='\t', row.names = FALSE,col.names = TRUE)
write.table(data.frame(visitas = data_sent$turista, estado = data_edos$V1 , row.names = NULL), file='sentimientos_turista.tsv', quote=FALSE, sep='\t', row.names = FALSE,col.names = TRUE)


sent_hogar = data_sent$hogar
names(sent_hogar)= row.names(data_edos)
sink("sentimientos_hogar.json")
cat(toJSON(sent_hogar))
sink()

sent_turista = data_sent$turista
names(sent_turista)= row.names(data_edos)
sink("sentimientos_turista.json")
cat(toJSON(sent_turista))
sink()
