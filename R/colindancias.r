# Analisis de estados colindantes
setwd("~/dataton/R")


#Lectura de datos
data_trans <- read.table('Data/trans.csv',header = TRUE, sep=',')
data_col <- read.table('Data/colinda.csv',header = TRUE, sep=',')

names <- c("Aguascalientes", "Baja.California", "Baja.California.Sur", 
       "Campeche", "Coahuila.de.Zaragoza", "Colima", "Chiapas", "Chihuahua", 
       "Distrito.Federal", "Durango", "Guanajuato", "Guerrero", "Hidalgo", 
       "Jalisco", "México", "Michoacán.de.Ocampo", "Morelos", "Nayarit", 
       "Nuevo.León", "Oaxaca", "Puebla", "Querétaro", "Quintana.Roo", 
       "San.Luis.Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", 
       "Tlaxcala", "Veracruz.de.Ignacio.de.la.Llave", "Yucatán", "Zacatecas")

d2 <- as.data.frame(matrix(ncol=3))

for(n in names){
  for(i in c(1:nrow(data_col))){
    if(data_col[i,n]>0){
      print(data_trans[i,n])
      print(as.character(data_trans[i,"Estado"]))
      print(n)
      d2[(nrow(d2)+1),] <- c(data_trans[i,n],as.character(data_trans[i,"Estado"]),n)
    }
  }
} 

d2$V1 <- as.numeric(d2$V1)
d2 <- d2[order(d2$V1*(-1)),]

