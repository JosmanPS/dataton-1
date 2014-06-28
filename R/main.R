rm(list = ls())

# Paso 1
# Paquetes requeridos.

doInstall <- FALSE  # Change to FALSE if you don't want packages installed.
toInstall <- c("sp","rgdal", "maptools",
               "ggplot2", "dplyr", "rgeos", "reshape2",
               "maps", "scales", "raster", "jsonlite")
if(doInstall){install.packages(toInstall, repos = "http://cran.r-project.org")}
lapply(toInstall, library, character.only = TRUE)

filename = "Data/tweets.csv"

Data = read.csv(filename, header = FALSE, strip.white = TRUE, as.is = TRUE)
names(Data) <- c("user.id", "lat", "long", "score")

# Paso 2.
# Encontrar en que estado se realizo cada tweet.

mex = readOGR("../Dashboard/Data/Resultados.geojson", "OGRGeoJSON")
zap = readOGR("../Dashboard/Data/zapopan.geojson", "OGRGeoJSON")

# Quitar acentos
levels(mex$NOM_ENT) <- gsub( "\341", "a", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\377", "e", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\355", "i", levels(mex$NOM_ENT))
levels(mex$NOM_ENT) <- gsub( "\363", "o", levels(mex$NOM_ENT))

mex.df = fortify(mex, region = 'CVE_ENT')
states <- (mex.df %.% group_by(id) %.% summarize(G1 = group[1]))$G1
mex.df <- mex.df %.% filter(group %in% states)

Data = Data[complete.cases(Data),]
Data = as.data.frame(Data %.% group_by(user.id) %.% filter(n()>10))

Loc = SpatialPoints(Data[,c("lat", "long")], proj4string=CRS(proj4string(mex)))
Loc.RL = over(Loc, mex)
Zap.Loc.RL = over(Loc, zap)

Data$State <- Loc.RL$CVE_ENT
Zap.Data = Data
Zap.Data$Zapopan <- 3
Data = Data %.% filter( Data$State != "<NA>")

Origen = Data %.% group_by(user.id) %.% summarise( Estado = names(which.max(table(State))))
Destino = Data %.% group_by(user.id) %.% filter( State != names(which.max(table(State))))
Destino = Destino %.% ungroup() %.% group_by(user.id, State) %.% summarise()

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

Trans = merge(Origen, Destino, by = c("user.id"))
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
Trans["09","15"] = 0
Trans["15","09"] = 0
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

Data = Data %.% group_by(user.id) %.% mutate( home = ifelse(State == names(which.max(table(State))),"hogar", "turista"))

RR = Data %.% group_by(State, home) %.% summarize(Score = mean(score, na.rm = TRUE))
RR = dcast(RR, State~home, value.var = "Score")

RR2 = Data %.% group_by(State) %.% summarize(Score = mean(score, na.rm = TRUE))
RR$todos = RR2$Score
RR = subset(RR, select=-State)
RR = exp(exp(RR+10))
min.RR = min(RR, na.rm = T)
max.RR = max(RR, na.rm = T)
RR = data.frame(lapply(RR, function(X) ((X-min.RR)/(max.RR-min.RR))))
rownames(RR) = RR2$State

writeLines(toJSON(RR), "../Dashboard/Data/sentimientos.json")
write.csv(RR, "../Dashboard/Data/sentimientos.csv")
