rm(list = ls())

# Paso 1
# Paquetes requeridos.

doInstall <- FALSE  # Change to FALSE if you don't want packages installed.
toInstall <- c("sp","rgdal", "maptools",
               "ggplot2", "dplyr", "rgeos", "reshape2",
               "maps", "scales", "raster", "jsonlite")
if(doInstall){install.packages(toInstall, repos = "http://cran.r-project.org")}
lapply(toInstall, library, character.only = TRUE)

Origen.file = "Data/origen.csv"
Destino.file = "Data/destino.csv"

Origen = read.csv(Origen.file, header = FALSE, strip.white = TRUE, as.is = TRUE)
Destino = read.csv(Destino.file, header = FALSE, strip.white = TRUE, as.is = TRUE)

names(Origen) <- c("user.id", "name", "lat", "long")
names(Destino) <- c("user.id", "name", "lat", "long")

# Paso 2.
# Encontrar en que estado se realizo cada tweet.

mex = readOGR("../Dashboard/Data/Resultados.geojson", "OGRGeoJSON")

# Quitar acentos
levels(mex$NOM_ENT) <- gsub( "\341", "a", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\377", "e", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\355", "i", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\363", "o", levels(mex$NOM_ENT))

mex.df = fortify(mex, region = 'CVE_ENT')
states <- (mex.df %.% group_by(id) %.% summarize(G1 = group[1]))$G1
mex.df <- mex.df %.% filter(group %in% states)

Origen.Loc = SpatialPoints(Origen[,c("lat", "long")], proj4string=CRS(proj4string(mex)))
Destino.Loc = SpatialPoints(Destino[,c("lat", "long")], proj4string=CRS(proj4string(mex)))

Origen.Loc.RL = over(Origen.Loc, mex)
Destino.Loc.RL = over(Destino.Loc, mex)

Origen$State <- Origen.Loc.RL$CVE_ENT
Destino$State <- Destino.Loc.RL$CVE_ENT

Origen = Origen %.% filter( Origen$State != "<NA>")
Destino = Destino %.% filter( Destino$State != "<NA>")

Origen.Persona = Origen %.% group_by(user.id) %.% summarise( Estado = names(which.max(table(State))))
Destino.Persona = Destino %.% group_by(user.id) %.% summarise( Estado = names(which.max(table(State))))

# Step 5.
# Tweets' location map.

# mex0 = getData('GADM', country="Mexico", level=0)
# mex.df0 = fortify(mex0)
# mex.df0 = subset(mex.df0, mex.df0$group == "0.1")

# P <- ggplot(Data, aes(x = lat, y = long))
# P <- P + geom_polygon(data = mex.df0, aes(x = long, y = lat), fill = "white")
# P <- P + geom_point(alpha = 0.2, size = 0.4, color = "black")
# P <- P + coord_fixed()
# P <- P + theme(axis.title.x = element_blank(),
#                axis.title.y = element_blank(),
#                axis.text.x = element_blank(),
#                axis.text.y = element_blank(),
#                axis.ticks.x = element_blank(),
#                axis.ticks.y = element_blank(),
#                panel.grid.major = element_blank(),
#                panel.grid.minor = element_blank(),
#                panel.border = element_blank())
# P

# Sample transition matrix.
# writeLines(toJSON(n.users), "../Data/nusers.json")
# n.users = Users %.% group_by(Estado) %.% summarise(n = n())
# test = data.frame(matrix(rpois(32*32, 500), nrow=32))
# row.names(test) = n.users$Estado
# names(test) = n.users$Estado
# writeLines(toJSON(test), "../Data/test.json")

Trans = merge(Origen.Persona, Destino.Persona, by = c("user.id"))
names(Trans) = c("user.id", "Origen", "Destino")
Trans = Trans %.% group_by(Origen, Destino) %.% summarise(n = n())
Trans = dcast(Trans, Origen ~ Destino, value.var = "n", fill = 0)
row.names(Trans) = Trans$Origen
Trans = subset(Trans, select=-Origen)

Locales = numeric()
for(i in 1:32)
{
    Locales[i] = Trans[i,i]
    Trans[i,i] = 0
}
Locales = as.data.frame(Locales)
row.names(Locales) = row.names(Trans)

Salen = rowSums(Trans)
Entran = colSums(Trans)

Locales$Salen = Salen
Locales$Entran = Entran

Salen = data.frame(lapply(Trans, function(X) round(X/rowSums(Trans),2)))
Entran = data.frame(lapply(Trans, function(X) round(X/sum(X),2)))
names(Salen) = names(Trans)
names(Entran) = names(Trans)

writeLines(toJSON(Trans), "../Dashboard/Data/transicion.json")
writeLines(toJSON(Locales), "../Dashboard/Data/resumen.json")
writeLines(toJSON(Entran), "../Dashboard/Data/entran.json")
writeLines(toJSON(Salen), "../Dashboard/Data/salen.json")
writeLines(toJSON(Salen), "../Dashboard/Data/resumen.json")

 # Analisis de Sentimientos
calificarEstados =  function(Data)
{
	RR = Data %.% group_by(State) %.% summarize(Score = mean(score, na.rm = TRUE))
	Results <- data.frame(id = sort(unique(mex.df$id)), val = NA)
	rownames(Results) = Results$id
	RR.min = min(RR$Score, na.rm = T)
	RR.max = max(RR$Score, na.rm = T)
	Results[as.character(RR$State), "val"] = (RR$Score-RR.min)/(RR.max-RR.min)
	Results <- Results[order(Results[,2]),]
	return(Results)
}
