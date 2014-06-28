rm(list = ls())

# Step 1.
# Install required packages.

doInstall <- FALSE  # Change to FALSE if you don't want packages installed.
toInstall <- c("sp","rgdal", "maptools",
			   "ggplot2", "plyr", "rgeos",
			   "maps", "scales", "raster", "xtable")
if(doInstall){install.packages(toInstall, repos = "http://cran.r-project.org")}
lapply(toInstall, library, character.only = TRUE)

# Step 2.
# Reverse geolocate every tweet.

mex = getData('GADM', country="Mexico", level=1)
levels(mex$NAME_1) <- gsub( "\341", "a", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\351", "e", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\355", "i", levels(mex$NAME_1))
levels(mex$NAME_1) <- gsub( "\363", "o", levels(mex$NAME_1))

mex.df = fortify(mex, region = 'NAME_1')
states <- ddply(mex.df, .(id), summarize, G1 =group[1])$G1
mex.df <- subset(mex.df, mex.df$group %in% states)

Data <- read.csv("Results/Data/coordinates.csv", header = FALSE)
names(Data) <- c("lat", "long", "score")

Loc    = SpatialPoints(Data, proj4string=CRS(proj4string(mex)))
Loc.RL = over(Loc, mex)

Data$State <- Loc.RL$NAME_1
Data = subset(Data, Data$State != "<NA>")

# Step 3.
# Construct data frame with tone by state.

RR = ddply(Data, .(State), summarize, Score = mean(score, na.rm = T))
Results <- data.frame(id = sort(unique(mex.df$id)), val = NA)
rownames(Results) = Results$id
RR.min = min(RR$Score, na.rm = T)
RR.max = max(RR$Score, na.rm = T)
Results[as.character(RR$State), "val"] = (RR$Score-RR.min)/(RR.max-RR.min)

# Step 4.
# Construct Top Tables
Results <- Results[order(Results[,2]),]
States.worst  <- head(Results, n = 5)
States.best <- tail(Results, n = 5)
States.best <- States.best[5:1,]

names(States.best) <- c("State", "Sentiment Score")
names(States.worst) <- c("State", "Sentiment Score")

Best.Tab = xtable(States.best)
print(Best.Tab, file ="Results/Table/best.tex", include.rownames = FALSE, only.contents = TRUE)

Worst.Tab = xtable(States.worst)
print(Worst.Tab, file ="Results/Table/worst.tex", include.rownames = FALSE, only.contents = TRUE)

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

ggsave("Results/Fig/tweets_location.eps", plot = P, device=cairo_ps, dpi = 600, width = 5, height = 4)

# Step 6.
# Plot map by states.

M <- ggplot(Results, aes(map_id = id))
M <- M + geom_map(aes(fill = val), map = mex.df)
M <- M + expand_limits(x = mex.df$long, y = mex.df$lat)
M <- M + geom_path(data = mex.df, aes(long,lat,group=group), color = "white" )
M <- M + coord_fixed()
M <- M + theme(axis.title.x = element_blank(),
          axis.title.y = element_blank(),
          axis.text.x = element_blank(),
          axis.text.y = element_blank(),
          axis.ticks.x = element_blank(),
          axis.ticks.y = element_blank(),
          panel.grid.major = element_blank(),
          panel.grid.minor = element_blank(),
          panel.border = element_blank(),
          legend.position = c(.9,.7),
          legend.background = element_rect(fill = NA))
M <- M + scale_fill_gradient2(low=muted("red"), mid="white", high=muted("blue"),
                               midpoint=.5)
M <- M + labs(fill = "Sentiment\nScores")

ggsave("Results/Fig/map.eps", plot = M, dpi = 600, width = 5, height = 4)
