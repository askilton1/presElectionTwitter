###################################################################################################
library("rjson")
library("httr")
library("RColorBrewer")
library("NLP")
library("twitteR")
library("base64enc")
library("tm")
library("plyr")
library("reshape")
library("reshape2")
library("ggplot2")
require("notifyR")
require("RMySQL")

source("keys.r")
setup_twitter_oauth(consumer_key,
                    consumer_secret,
                    access_token,
                    access_secret)
2
####################################################################################
userlist <- politicians <- c(
  "realdonaldtrump",
  "hillaryclinton",
  "realbencarson",
  "tedcruz",
  "berniesanders",
  "jebbush",
  "govgaryjohnson",
  "drjillstein",
  #"senwarren",
  "marcorubio",
  "martinomalley",
  "chrischristie",
  "lindseygrahamsc",
  "johnkasich",
  "mike_pence",
  "timkaine"
)
register_mysql_backend(dbname,host,user,password)
for (i in 1:10){  
  for (i in 1:length(userlist)){
    tweettweet <- userTimeline(userlist[i], 
                               n=3200, 
                               #sinceID=recent, 
                               includeRts=TRUE,
                               excludeReplies=FALSE,
                               retryOnRateLimit=9999999999
    )
    store_tweets_db(tweettweet,"compiled_staging")
    print(paste("uploaded",userlist[[i]]))
  }
  poliDB <- dbConnect(MySQL(),user=user,password=password,dbname=dbname,host=host)
  dbSendQuery(poliDB,paste("DELETE FROM politicians.compiled_allTweets
	                                WHERE `id` IN 
                                    (SELECT `id` FROM politicians.compiled_staging);"))
  dbSendQuery(poliDB,paste("INSERT INTO politicians.compiled_allTweets
	                                SELECT *
                                    FROM politicians.compiled_staging;"))  
  dbSendQuery(poliDB,paste("DELETE FROM politicians.compiled_staging;	"))  
  suppressWarnings(try(send_push(userkey,"Politicians uploaded")))
  rs <- dbSendQuery(poliDB,"SELECT * FROM compiled_allTweets")
  df <- fetch(rs, n=-1)#retrieves data. n=number of records to retrieve; -1=all records
  dbSendQuery(poliDB, "SELECT ID AS toKill INTO @toKill FROM INFORMATION_SCHEMA.PROCESSLIST WHERE USER='rCode' LIMIT 1;")
  try(dbSendQuery(poliDB, "KILL @toKill;"))#line will produce error, but successfully kills connection

  #----------------------
  df$day <- substr(df$created,1,10)
  df$created <- as.POSIXct(df$created,origin="1970-01-01",format="%Y-%m-%d %H:%M:%S",tz="EST")
  df$created <- df$created-60*60*7 #correct time zone to eastern time
  
  #Sanders campaign
  df$sandersCampaign <- 0
  df$sandersCampaign[df$created>="2015-04-30" & df$created<="2016-07-15"] <- 1
  
  #Clinton campaign
  df$clintonCampaign <- 0
  df$clintonCampaign[df$created>="2015-04-12"] <- 1
  
  #Carson campaign
  df$carsonCampaign <- 0
  df$carsonCampaign[df$created>="2015-05-03" & df$created<="2016-03-04"] <- 1
  
  #O'Malley campaign
  df$omalleyCampaign <- 0
  df$omalleyCampaign[df$created>="2015-05-30" & df$created<="2016-02-01"] <- 1
  
  #Graham campaign
  df$grahamCampaign <- 0
  df$grahamCampaign[df$created>="2015-06-01" & df$created<="2016-02-21"] <- 1
  
  #Bush campaign
  df$bushCampaign <- 0
  df$bushCampaign[df$created>="2015-06-15" & df$created<="2015-02-20"] <- 1
  
  #Trump campaign
  df$trumpCampaign <- 0
  df$trumpCampaign[df$created>="2015-06-16"] <- 1
  
  #Stein campaign
  df$steinCampaign <- 0
  df$steinCampaign[df$created>="2015-06-22"] <- 1
  
  #Christie campaign
  df$christieCampaign <- 0
  df$christieCampaign[df$created>="2015-06-30" & df$created<="2016-02-10"] <- 1
  
  #Kasich campaign
  df$kasichCampaign <- 0
  df$kasichCampaign[df$created>="2015-07-21" & df$created<="2016-05-2016"] <- 1
  
  #-----------------------
  df$dow <- format(df$created, format = "%a")
  df$hr = format(as.POSIXct(df$created), format = "%H")
  df$weekend = 0
  df$weekend[df$dow=='Sat'|df$dow=='Sun'] <- 1
  df$hr <- as.numeric(df$hr)
  df$timeOfDay <- 'afternoon'
  df$timeOfDay[df$hr < 5] <- 'night'
  df$timeOfDay[df$hr >= 5 & df$hr < 11] <- 'morning'
  df$timeOfDay[df$hr >= 18] <- 'evening'
  #-----------------------
  #debates
  df$debateGOP <- 0
  df$debateGOP[df$day=="2015-08-06" | df$day=="2015-09-16" | df$day=="2015-10-28" | df$day=="2015-11-10" |
                 df$day=="2015-12-15" | df$day=="2016-01-14" | df$day=="2015-01-28" | df$day=="2016-02-13" | 
                 df$day=="2016-02-25" | df$day=="2016-03-03" | df$day=="2016-03-10" | df$day=="2016-03-10" | 
                 df$day=="2016-03-21"] <- 1
  
  df$debateDem <- 0
  df$debateDem[df$day=="2015-10-13" | df$day=="2015-11-14" | df$day=="2015-12-19" | df$day=="2016-01-25" |
                 df$day=="2016-02-04" | df$day=="2016-02-11" | df$day=="2016-03-06" | df$day=="2016-03-09" | 
                 df$day=="2016-04-14"]<- 1
  #-----------------------
  #conventions
  df$conventionGOP <- 0
  df$conventionGOP[df$created>="2015-07-21" & df$created<="2016-05-2016"] <- 1
  
  df$conventionDem <- 0
  df$conventionDem[df$day=="2015-10-13" | df$day=="2015-11-14" | df$day=="2015-12-19" | df$day=="2016-01-25" |
                     df$day=="2016-02-04" | df$day=="2016-02-11" | df$day=="2016-03-06" | df$day=="2016-03-09" | 
                     df$day=="2016-04-14"]<- 1
  #-----------------------
  #Key words
  #how to add matrixes in table together to facilitate use of multiple words
  df$healthcare<-as.numeric(unlist(lapply(gsub("[^[:alnum:]///' ]","",df$text),function(x) grepl(paste(c("medi","Obamacare","ACA","hospital","deductible","medical","medicare"),collapse="|"),x)>=TRUE)))
  
  #name calling
  df$nameCallingDonald<-0
  df$nameCallingDonald[df$screenName=="realDonaldTrump"]<-as.numeric(unlist(lapply(gsub("[^[:alnum:]///' ]","",df$text[df$screenName=="realDonaldTrump"]),function(x) 
    grepl(paste(c("crooked","low energy","lyin","little marco", " 1 for ","goofy","crazy Bernie", "crazy Megyn", "crazy @megynkelly","scum", "disgusting"),collapse="|"),x)>=TRUE)))
  
  df$raceDonald <- 0
  df$raceDonald[df$screenName=="realDonaldTrump"]<-as.numeric(unlist(lapply(gsub("[^[:alnum:]///' ]","",df$text[df$screenName=="realDonaldTrump"]),function(x) 
    grepl(paste(c("illegals","muslim","mexican","border")
                ,collapse="|"),x)>=TRUE)))
  
  df$bigBusinessAndBanks <- 0
  df$bigBusinessAndBanks[df$screenName=="realDonaldTrump"]<-as.numeric(unlist(lapply(gsub("[^[:alnum:]///' ]","",df$text[df$screenName=="realDonaldTrump"]),function(x) 
    grepl(paste(c("bank","Wall Street","corporate","corporation","wealthy","lobbyist",
                  "big business","big money","too big to","dollars","Citizens United",
                  "hedge","financial","mortgage")
                ,collapse="|"),x)>=TRUE)))
  #sad
  df$sadDonald <- 0
  df$sadDonald[df$screenName=="realDonaldTrump"]<-as.numeric(unlist(lapply(gsub("[^[:alnum:]///' ]","",df$text[df$screenName=="realDonaldTrump"]),function(x) 
    grepl(paste(c("sad"),collapse="|"),x)>=TRUE)))
  #-----------------------
  #length of tweets
  df$tweetLength <- unlist(lapply(as.character(gsub("[^[:alnum:]///' ]","",df$text)),nchar))
  # mod<-lm(retweetCount~weekend,screenName=="realDonaldTrump",data=df)
  # stargazer(mod,type="text")
  #-----------------------
  #number of hashtags in each tweet
  df$hashtag<-unlist(lapply(df$text,function(x) if(gregexpr("#",x)[[1]]!=-1){length(gregexpr("#",x)[[1]])}else{0}))
  #-----------------------
  df$rtFavRatio<-round(df$retweetCount/df$favoriteCount,2)
  df$rtFavRatio[df$retweetCount==0 | df$favoriteCount==0] <- 0
  df$rtFavRatio<-as.numeric(df$rtFavRatio)
  #-----------------------
  # df$isRetweet[df$isRetweet==0]<-FALSE
  # df$isRetweet[df$isRetweet==1]<-TRUE
  #dbWriteTable(con, name="table_name", value=df, field.types=list(dte="date", val="double(20,10)"), row.names=FALSE)
  compiledDB <- dbConnect(MySQL(),user=user,password=password,dbname=dbname2,host=host)
  
  dbWriteTable(compiledDB,paste("compiled_",round(as.numeric(as.POSIXct(Sys.time()))),sep=""),df[,c(-2,-4,-6,-7,-9,-14,-15,-16)],
               field.types=list(
text='varchar(140)',favoriteCount='integer',created='timestamp',id='bigint',statusSource='varchar(200)',screenName='varchar(40)',retweetCount='integer',isRetweet='boolean',day='varchar(10)',sandersCampaign='boolean',clintonCampaign='boolean',carsonCampaign='boolean',omalleyCampaign='boolean',grahamCampaign='boolean',bushCampaign='boolean',trumpCampaign='boolean',steinCampaign='boolean',christieCampaign='boolean',kasichCampaign='boolean',dow='varchar(3)',hr='integer',weekend='boolean',timeOfDay='varchar(9)',debateGOP='boolean',debateDem='boolean',conventionGOP='boolean',conventionDem='boolean',healthcare='boolean',nameCallingDonald='boolean',raceDonald='boolean',bigBusinessAndBanks='boolean',sadDonald='boolean',tweetLength='integer',hashtag='integer',rtFavRatio='decimal(6,2)'),row.names=FALSE)
  
  dbSendQuery(compiledDB,"drop table compiled")
  dbWriteTable(compiledDB,"compiled",df[,c(-2,-4,-6,-7,-9,-14,-15,-16)],
               field.types=list(
text='varchar(140)',favoriteCount='integer',created='timestamp',id='bigint',statusSource='varchar(200)',screenName='varchar(40)',retweetCount='integer',isRetweet='boolean',day='varchar(10)',sandersCampaign='boolean',clintonCampaign='boolean',carsonCampaign='boolean',omalleyCampaign='boolean',grahamCampaign='boolean',bushCampaign='boolean',trumpCampaign='boolean',steinCampaign='boolean',christieCampaign='boolean',kasichCampaign='boolean',dow='varchar(3)',hr='integer',weekend='boolean',timeOfDay='varchar(9)',debateGOP='boolean',debateDem='boolean',conventionGOP='boolean',conventionDem='boolean',healthcare='boolean',nameCallingDonald='boolean',raceDonald='boolean',bigBusinessAndBanks='boolean',sadDonald='boolean',tweetLength='integer',hashtag='integer',rtFavRatio='decimal(6,2)'),row.names=FALSE)
dbDisconnect(compiledDB)

if (R.version !="linux-gnu") {
	suppressWarnings(try(send_push(userkey,"All done!",sessionInfo()$platform)))
	break
	}
 Sys.sleep(7200)
}

