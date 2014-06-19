rm(list = ls())

library(dplyr)

# Paso 1
# Paquetes requeridos.

doInstall <- FALSE  # Change to FALSE if you don't want packages installed.
toInstall <- c("sp","rgdal", "maptools",
               "ggplot2", "dplyr", "rgeos",
               "maps", "scales", "raster")
if(doInstall){install.packages(toInstall, repos = "http://cran.r-project.org")}
lapply(toInstall, library, character.only = TRUE)

filename = "../Data/results.csv"
Data = read.csv(filename, header = FALSE, strip.white = TRUE, as.is = TRUE)
names(Data) <- c("user.id", "name", "lat", "long")

# Paso 2.
# Encontrar en que estado se realizo cada tweet.

mex = getData('GADM', country="Mexico", level=1)

# Quitar acentos
levels(mex$NAME_1) <- gsub( "\341", "a", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\351", "e", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\355", "i", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\363", "o", levels(mex$NAME_1))

mex.df = fortify(mex, region = 'NAME_1')
states <- (mex.df %.% group_by(id) %.% summarize(G1 = group[1]))$G1
mex.df <- mex.df %.% filter(group %in% states)

Loc    = SpatialPoints(Data[,c("lat", "long")], proj4string=CRS(proj4string(mex)))
Loc.RL = over(Loc, mex)

Data$State <- Loc.RL$NAME_1
Data = Data %.% filter( Data$State != "<NA>")

Users = Data %.% group_by(user.id) %.% summarise( Estado = names(which.max(table(State))))

# Step 5.
# Tweets' location map.

mex0 = getData('GADM', country="Mexico", level=0)
mex.df0 = fortify(mex0)
mex.df0 = subset(mex.df0, mex.df0$group == "0.1")

P <- ggplot(Data, aes(x = lat, y = long))
P <- P + geom_polygon(data = mex.df0, aes(x = long, y = lat), fill = "white")
P <- P + geom_point(alpha = 0.2, size = 0.4, color = "black")
P <- P + coord_fixed()
P <- P + theme(axis.title.x = element_blank(),
               axis.title.y = element_blank(),
               axis.text.x = element_blank(),
               axis.text.y = element_blank(),
               axis.ticks.x = element_blank(),
               axis.ticks.y = element_blank(),
               panel.grid.major = element_blank(),
               panel.grid.minor = element_blank(),
               panel.border = element_blank())

ggsave("..Results/Fig/tweets_location.eps", plot = P, device=cairo_ps, dpi = 600, width = 5, height = 4)