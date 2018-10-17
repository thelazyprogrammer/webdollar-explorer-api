//
// how to install mongodb
// https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04
//
// pouchdb does not need to be installed
// blockchainDB3 needs to be in the folder
//
// Example to sync blocks from 0 to 1000
//   # install mongodb
//   npm install
//   node pouchdb-mongodb-syncer.js 0 1000
//
// It syncs only the block information to the
// blocks collections in the MongoDB blockchainDB3 database
//
// To do:
//   1. Create transactions collection

const atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  winston = require('winston');

const MongoClient = require('mongodb').MongoClient;

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: __filename + '.log' })
  ]
});

const mongodbBlockchainDB = "blockchainDB3"
const mongodbBlockCollection = "blocks"
const mongodbTransactionCollection = "transactions"
const mongodbMTransactionCollection = "mtransactions"
const mongodbUrl = "mongodb://localhost:27017"

const PREFIX_BASE64 = "584043fe"
const SUFFIX_BASE64 = "FF"
const BASE_REWARD = 6000
const FIRST_BLOCK_REWARDS = [1, 1867487789, 1007804769, 552321669, 307400655, 173745886, 99728963, 58133318,
  34413271, 20688253, 12630447, 7830882, 4930598, 3152722, 2047239, 1350046, 904119,
  614893, 424689, 297878, 212180, 153485, 112752, 84116, 63728, 49032, 38311, 30400,
  24497, 20047, 16660, 14061, 12051, 10490, 9272, 8323, 7588, 7025, 6604, 6306, 6113]
exports.FIRST_BLOCK_REWARDS = FIRST_BLOCK_REWARDS
const TRX_NONCE_V2_BLOCK = 46950
const GENESIS_ADDRESS_FORK = 'WEBD$gDZwjjD7ZE5+AE+44ITr8yo5E2aXYT3mEH$'
const HARD_FORKS_WALLET_RECOVERY = 153060
const GENESIS_AMOUNT_FORK = 18674856891922
const GENESIS_ADDRESS_TIMESTAMP = 'Wed, 11 Jul 2018 11:19:52 GMT'

function getVirtualTransactionsFromHardFork() {
      return {
           "WEBD$gCI4g2ePRP6oyfVdqF1e4f36CSEnjMus0D$":-72493010000,
           "WEBD$gAL20HcccJv#7yb7FAW4PBLF$GuznBNppj$":-59500000000,
           "WEBD$gCs#kIRWjk6VK1me23wVbVhcvifxNRH@kr$":-50002410000,
           "WEBD$gAUA2qpu@fdF8mbYiK09CrPepZ2kF3us+T$":-3410370000,
           "WEBD$gCNa0reZgVBZ4Ao9$Fdxg7jJT7t9IzZdHr$":-30000000000,
           "WEBD$gD$XiN5r1uVU#QgZRhM@en8dR1xLB@BEtf$":-331776851311,
           "WEBD$gAoKHsE#ofUgDR5nBXzz$d2osXUkQKG8YT$":-30000000000,
           "WEBD$gDvsqIt28D+JGYDgH3a$zfKdtnSDIoBfMj$":-30000000000,
           "WEBD$gBf3aFQ3x60Sy7IjKW11PKRBsBU7g$BtTP$":-5150200000,
           "WEBD$gDUF#9udyMBunHuckI#qy18NQQ@GXCyGFv$":-24849400000,
           "WEBD$gCvEEh7t36zJ1HwcywEtPg3uB+hwqv#6nr$":-15000000000,
           "WEBD$gB+jFjcYkZvSmN$4MrbooUmPkiIgpWMupT$":-7679600000,
           "WEBD$gDpL+ZrWG@FZ@W44AH5b@XKNL6Nm@EtrWP$":-27509492,
           "WEBD$gDqHf#7XqVXb3A+SThuM9YJ0Vk7APs9Sh3$":-11234900000,
           "WEBD$gCGdPQLohdeHQqa+ptoJ@QK2LCvN7IS5JX$":-144304338450,
           "WEBD$gAizMSPYd8bbEnj#msFfKhyGYKtc4eZq$f$":-500514150000,
           "WEBD$gBgoD@HGUkzJYKaT+9P06YHi42P13A5C@3$":-499484250000,
           "WEBD$gCyRA$hcf69sIeWy@Vqqv6gZY@i7tFywcL$":-1000000100000,
           "WEBD$gBBUX#hpTTM707GHUhH$EEchYmKumNm3V7$":-10000400000,
           "WEBD$gD7zdUjrGsQCdTxfYYBetGDPo$3hPdRfoj$":-158771170000,
           "WEBD$gD6N6#@M@Tur+q7a4GdMq0AGikucD06+S$$":-106544640000,
           "WEBD$gD+BhYnHP6Hq638Q#ULMAVK6hcx+1894or$":-146495900000,
           "WEBD$gDU+tP3@42@L9$Is463vDJi4IKrabPNNn$$":-312439297,
           "WEBD$gBCkW6zQQSwo0AQ95RcLtGIi$egexiFNzn$":-69999600000,
           "WEBD$gBwfMzq00SvfSZtiYDgZBPZDX+ECV0IuTf$":-9999800000,
           "WEBD$gD6kjAok9mL$r9eLPv1$LCCq39yai9Hi0f$":-60000000000,
           "WEBD$gDzwF0ArIz2UrWfk0n64Byc2KeIYnf8z3j$":-33721550,
           "WEBD$gC3bRwhM8cciLCJnnPtr22Not0N4N4LSW3$":-241290700000,
           "WEBD$gAuVnxLUbZc#tJ2Gm+Lqh6Qqr#ZJxVgQ#j$":-10000500000,
           "WEBD$gDjtNXangkzYJxRLWhBPwSSDMC0ha$gbCz$":-7200100000,
           "WEBD$gBkeL04WBpUdFfi6AAm$334VxLaHiu3x8r$":-120100000,
           "WEBD$gCt0MQmg0TP0CEICyKqzJjoAjzLkg$66$P$":-22589470,
           "WEBD$gBPJmvI1GScq6sck2o6U0jbrFe#SroRRnf$":-280000000000,
           "WEBD$gA4W9tWX3qH+mof5SUmK1PMVRno+Y9Q$Yb$":-48022350000,
           "WEBD$gCjc#Pa42$iAe1V@L4rbtGt@0WnBU@+35L$":-319999200000,
           "WEBD$gBvPUu9cpq8nMNZZe1ojGfkA8DZT87hmHH$":-200000000000,
           "WEBD$gBxgu5KhUgMyq70MxPsIDLmKghPhXLvJUH$":-13108410000,
           "WEBD$gC@AgTovodqqyBTmvcKrLayGLXU36@hraz$":-299999900000,
           "WEBD$gC3ubgck#m5U3TF@iN@FMSeK7AErZTERXv$":-269999800000,
           "WEBD$gAPIcafjmpsZDwIxfnS+6Lbbt45Pr@+pQT$":-150000000000,
           "WEBD$gARIJGw3PQ5NUG1FAqR@2x6UCwwi4qf7zX$":-149999900000,
           "WEBD$gCnnEZZqzSWYon456tYj+dy2o7kXuYp9Dj$":-78262480000,
           "WEBD$gApdUUz8oZUD@hHx4i00cM1x@QWeJy@Y33$":-10001300000,
           "WEBD$gCrP1BQqV0Qo@IotsUT3$DHmJsnkfmuKPP$":-182883970000,
           "WEBD$gDR5uT2L5ZDt93FB3ACwx@YXZMVPJvvRQj$":-45917418000,
           "WEBD$gAXv5@Zhq@tH3wFfhNgebN0yx7UP7$epsr$":-150000000000,
           "WEBD$gDj1dBsAjAUHDSmWvy$YV5wkFxPCV#QLaD$":-8803389,
           "WEBD$gDwzvvfITevWUIdgZqwoZcMeoMKepvn#Nr$":-120177480000,
           "WEBD$gBmVBdnZSVUbKphi@Q8I59N7YxLKgcUCQP$":-94162149990,
           "WEBD$gAhEJu3dVrA7JwS2rxiqqmfTWNmIT+BxRf$":-28744170000,
           "WEBD$gBimi+smpTQIVTLb37284BxMxev3mV#XJz$":-222422596978,
           "WEBD$gBpM63KeuGKLPY3vNT0bDdd1#aw4NXi9cL$":-93344030062,
           "WEBD$gBEGMkhAPFoL1vcF+yK1G0+uH0eDInoawb$":-251819829938,
           "WEBD$gD0@3NaJrALd4tf4G9+ikfZh$TUdPPMxR3$":-103404900000,
           "WEBD$gA3PjoZPNRI5DryGqZpRxJyUzbtGI2NVv3$":-359998980000,
           "WEBD$gBS@h+LUHLA#APB8eJbC8a3yqEGZdq0mKT$":-21348210011,
           "WEBD$gBRJ8PIKr0hvxkFt3Tj2hL@BpfIR7NFtUP$":-207464570000,
           "WEBD$gBxLoPf3ybmpGx0t5meR+Z$R9M9rCGDe5T$":-137182353011,
           "WEBD$gBQSyf58N6#JhE8c@nIp9Qr+CGUv+FWp2L$":-144499160000,
           "WEBD$gCAqs7bwLf8ku0C8Q+xtpKY9GiBophnbx7$":-239123450000,
           "WEBD$gCX@b7opCEWMNYN+91E1CuM7m@vLY3usTb$":-349999700000,
           "WEBD$gD2u2PFecv#fm0wYtcAcb0YRem9QsEGq@$$":-28680208611,
           "WEBD$gAzygvuF2zrtu3NoqFkUUfswidob8YPuGn$":-150000200000,
           "WEBD$gDxFq+B+zb8$YMB8ivofB95VnecR$NeLLH$":-11201240000,
           "WEBD$gCaUzkhg7nqaBqPIUKm5fU3g8it1GX3#tT$":-234120010000,
           "WEBD$gBnziQMgSNb2ruoi3$UAuhrjGM$h5j$Xy$$":-341230130000,
           "WEBD$gD+KWSZ2Di69H7DC4+kRN2AbCbDrXy7utz$":-171390530000,
           "WEBD$gAdNsLRkSP7xy+R#xja$4zradCd#w4RFR$$":-50972270000,
           "WEBD$gA649CP$DgMrm0rbnr3NVEE0G0AP4d5ua3$":-211175400000,
           "WEBD$gCU3ug3wLfmHVTGAcf26cfCgGatNzmRKH$$":-242997460000,
           "WEBD$gBbiWLyj8jiR4n@#D$2DrtLH$+ohfua@hL$":-200000100000,
           "WEBD$gAGk$Za$YZkxeT2f1oPjpo2HW954yQp7GD$":-149999600000,
           "WEBD$gBy1N+LDIuFTnkHriQgidPnUEMVb9MfWMr$":-230120000000,
           "WEBD$gCrEhDsa9Wv$@x3QkNd4jbNcb5bISk8Nyv$":-99373170892,
           "WEBD$gBJs7+TLZ@n+Q1qsCtGy8Nn01Mi6MGEIAv$":-223910140000,
           "WEBD$gCbdIAe5LWM1Xb4IP9Byz+$V2To0AC9t$n$":-11159574900,
           "WEBD$gBm0hR+aPZvfX@bMMMQ6fL05oA0x6ea3f$$":-391829170010,
           "WEBD$gCc8Z7ftdddLmgr1TEo+3m2hFWXitIXyZ$$":-200000000000,
           "WEBD$gAHL+#rzvXvvR7Kb@0f23g+mDgiPs$D0TP$":-271289460000,
           "WEBD$gAz4X9PX0ULTHhA2AKXBi$LnxnP#jUbt9$$":-231289595100,
           "WEBD$gCK7s97a26cFRcoPbuUWwBeowhbuWC6zxz$":-341239000000,
           "WEBD$gA90tUrPr5eMCP4GDXCiWnu06B7AympBdj$":-6125280000,
           "WEBD$gAVIvJkcgYPJqEgZbLEdM6Ek7envuKahez$":-24815230000,
           "WEBD$gAfhsHT@9UN9f6st4XYAkCbFFLenC4+ECH$":-21314860000,
           "WEBD$gDYYE0NY6iInHF4Zpq0P4CNxxA61iqbQ8b$":-10516425,
           "WEBD$gDzXma7QQmI7fEUz3KvVZCv$ve@b6m8+GT$":-41234880000,
           "WEBD$gBSxkSLKMXKT6bhYt6NIFg263@dWT@SZmL$":-23104190000,
           "WEBD$gC5R8X7Gx+2Kb3bR@T88KtgJh5vkfbSj+T$":-32218700000,
           "WEBD$gBGMtzDgCbt2JhNSDpVaz7D7qkKFx8MhUf$":-108970000,
           "WEBD$gBbPs8Gv6JCz7@KxjQ3@H@xp8vh7MeGMyH$":-49461919,
           "WEBD$gA21Vt6kkRp5JAVmhyLpo3bSB6$booRp53$":-199999700000,
           "WEBD$gDV0fZ3mqyISBMkF8WgyahxGT6YaoFj+cr$":-573590000,
           "WEBD$gBHyCPzLYNgx8NzxKzbHyp38c9aa#jhjif$":-499700000,
           "WEBD$gCPV@HU$MuqSi7pNbpzmQ8QLVhpobEVu8T$":-499900000,
           "WEBD$gC3hRqSB0$uCVGnLXYWwjyTMbznac#VFRj$":-499700000,
           "WEBD$gAtVASM@IUcS1r2Su6qcCzIHLS6ieEZF$7$":-2000000000,
           "WEBD$gAm+yjRtQbFguheGcLXC+oYpTLiF8D4ahP$":-500000000,
           "WEBD$gA#iyA+7PiHD@rZAQBLvCL0cNiJ#83y9eX$":-383455980000,
           "WEBD$gBBJnCJCf4$c#LRuFzm@u9q@bev6XkpbJv$":-8422396,
           "WEBD$gCFnrZ+kQfaaorL1#k58bb$DmI2FuKpqGP$":-220000000000,
           "WEBD$gB17T@oR2wD8qD8+aMNby9MceJ9q2zJX@j$":-49999900000,
           "WEBD$gBkoyiZqay9@EEwVM9NB7E#e6tdU4Ihboz$":-7813948,
           "WEBD$gB@KqDwI08#5$o9otmP8KytRTL35MvNz8f$":-38361910,
           "WEBD$gBxMqjDJRYpme+dPx1J0I8uZqU9q425p$$$":-2894484,
           "WEBD$gDRMhq32+WmDtYeutjMDNQGXAUECYRnwFn$":-134500000,
           "WEBD$gB@Ip5RDeQTiWaBZ4J2#WJxSWLYCvn2Z4H$":-9874207,
           "WEBD$gC+Z$NBVyK7A89G8g@@EDdd7VT0f6xke2$$":-9999200000,
           "WEBD$gCffq7YwMMwj3vto7xgU#WZcgmApX+BGu3$":-16283673,
           "WEBD$gCH9+bhxX4ATZ9jIC0j7KE0Q89ITGywUuz$":-11940689,
           "WEBD$gA7FdyqTnFWFaxuL3FBgBci6od97UXddgv$":-2652756,
           "WEBD$gB0Zvmd$8AoLgVf4IcEEexx6F+PzARRPEr$":-132480720000,
           "WEBD$gAWq@bFDn+4XUZP+u$I1y+yWkt#q#Db7VD$":-127070780000,
           "WEBD$gAIWP7063NES4JCozjVVHz50MaGte+CY33$":-139012740000,
           "WEBD$gCWv43BYS3DSGnaW1KbZWBhrV8b4u7oTJ$$":-227311340000,
           "WEBD$gASKTKyJuhbJ8NFqGkQSsUo$c9KSwmxixX$":-139107740000,
           "WEBD$gBRMpicC7HBjFFGwC9v6o7MQ5ILAq40ovL$":-129860620000,
           "WEBD$gBSu7peg@KhCI3@wgWriPG@7dzYovZR3AD$":-161370120000,
           "WEBD$gB#TZVrt@DLNREsSLSRoJEI5xbLa6ddGCH$":-61322310000,
           "WEBD$gDN1JaxGDVqqohDJfko8VI6v$GrgGfr+Rr$":-137878070000,
           "WEBD$gDxzNVw2tDey9v2vboZdY5Q5V5U9nNGr+$$":-157418940000,
           "WEBD$gC8CCLVkxBrFSfbP7nCcVsKYxcZCp#vzP3$":-198234410000,
           "WEBD$gD1wFizfTDKrSo@mjDFbQYwz6Lhu#8tTEn$":-166896190000,
           "WEBD$gC0Sm11z5zWfLygx5ICIVFH1+0jHit$odf$":-70719220000,
           "WEBD$gDk6mMd8oDYzL$8DYt7Sz5J8vXztcjevDT$":-2500000000,
           "WEBD$gD33iHJfp@wvyK+W+pLWArtsnKULogvoFn$":-9533475,
           "WEBD$gD2RPbxY2aDdeARyTtbC4E4nK@Fwji@aKD$":-6999800000,
           "WEBD$gCGBGwcTpnaTr2@gio7yyrThvi+yTeVWB7$":-15000100000,
           "WEBD$gBQrCvn5Q@Tg@0HeVdMwhKy5LJ7nWy$M+f$":-15000000000,
           "WEBD$gCMj3A$FxVxKRhYG8vkt0EjQ0Z05dCokHr$":-4640568,
           "WEBD$gAhRhbz180ia0i$5yijVPjMNZD0YH9oouD$":-6870936,
           "WEBD$gDkcRvzFLCUJdrG1rW1xv4GHjmAsDZn2sf$":-9999900000,
           "WEBD$gBp4e0DK$E9C@MMwm4tZC@KhvhITJ4+MPr$":-5714629,
           "WEBD$gBL6Hn+e9YVI4cq+gsFSbHArT@Y23xFN1H$":-10000000000,
           "WEBD$gAArIuXCHU6a6xzTH6D7a4S$smI4P0NIxL$":-141231850000,
           "WEBD$gCi8L4Vaf8iP0MhunDuaRH@AUDo@nb7avX$":-179827160000,
           "WEBD$gDC6REUPFdRxThPbjx@YtW5Eaw9C0apEQf$":-19286740000,
           "WEBD$gCqDQ9st8FdEQG61ZA3PGy7Nj4z5QKcSqn$":-280000100000,
           "WEBD$gDSd+tpb$iSZJTEIgqUT0zMdEZYda$vE6f$":-157289120000,
           "WEBD$gDdhxx8vd@bjgysGD1$a$vV8Y#KZa3I$$v$":-7265890000,
           "WEBD$gDHJSnzd668fsD4yNhzv0j38ANzFbvB6vz$":-269999300000,
           "WEBD$gDmq72gmMouQwhAWDK+wjAyvvRRFZyJLCX$":-140281470000,
           "WEBD$gD3WudTLr4kSRITpGharqUjz1PP0hxvdI3$":-39284670000,
           "WEBD$gAc6rAn#H2CzzgjZDDdBf1yRNf4vApeRq3$":-56275890000,
           "WEBD$gDpXFWDI9mmmTuh37RVAR5FGWRR5#L3MnH$":-9999900000,
           "WEBD$gCagYVpZhzCQ9zcGidBAvwgTU48kSGb78v$":-173857280000,
           "WEBD$gAk$$iUsgo4IhXZhuRS5f8sLX5S2AqEE@b$":-120347280000,
           "WEBD$gAQ+3dz3VYaCjCp5P#e$1Soapn#Qk7LiZb$":-182934560000,
           "WEBD$gDEgfy8hR1qpYV@JSaX5XzFBUkxXIEI3dX$":-132560980000,
           "WEBD$gBI#Eyw1BgP1IRmkeTIUURG6IFiITmPbmv$":-119385290000,
           "WEBD$gB3pU9dauUiBF1IZvvo#ytNMjNWERPI9dr$":-151920590000,
           "WEBD$gBi6+938WxuV7h4La6tJfTe11oGXKEarxH$":-179347650000,
           "WEBD$gBmixTZVcniKeamnV5u2$sIRyqUVwDc00b$":-10000000000,
           "WEBD$gBSe9a603w6rAMmVL4sEmgd35RXaSL1F53$":-137829120000,
           "WEBD$gAhD9TsWRHNKYKJNqVhnUZ9BM0ewjW+Den$":-5000100000,
           "WEBD$gAYIX8zoFX$a7qDycXX72pGQvn47xt3fDT$":-239827480000,
           "WEBD$gAyQEB2Im2WFNGghyQjCHaDXBKDeZL8wNz$":-349998800000,
           "WEBD$gAGD8R+dUoBBawcbZz4KvTDB1CntfMT01H$":-172839430000,
           "WEBD$gDc6aQ9s2UzsDgDCCAozS0yko9g91nWpLb$":-6909445,
           "WEBD$gDRhRUNccBHdE@nAoCVDtRnZMzCfg+VJSP$":-20273860000,
           "WEBD$gDLLEm+$LoVe6#YVD1vKEzvL7Sn$@mEBs7$":-151220100000,
           "WEBD$gCNc4HDG$muyALFU2jQ#W6n8KfyqNGoIjn$":-151238510000,
           "WEBD$gDhutwWAiR1@6ve0Zx82HpSYDPJQ4Nym8b$":-5000100000,
           "WEBD$gDzUg9Cp1AnuS2VIuXryMc9w0cgunyXZo3$":-9999900000,
           "WEBD$gA$YdXWCFiysHfFk3Nx$kAK7ULWY2mNUP$$":-9999900000,
           "WEBD$gBF8G5jzL4VqGxRju$G$cqx5wGeCo@6jAn$":-9999900000,
           "WEBD$gA7npK@#CUjgJDXeN+mV1JBKE@x6HfX96z$":-10984480000,
           "WEBD$gC2KYkbfa75xubnfe@qWGxxI#ggteFPncr$":-14999700000,
           "WEBD$gBE#$v6NioM+Mv#wYttU2wA8r0XKFh$K8r$":-15799800000,
           "WEBD$gCgNEoB$pXIaLjaIVqBjToHu02zx66g$hn$":-14199800000,
           "WEBD$gC7syvQJkaBVEqTpPqFpZSeqybKg1yEDhX$":-14999800000,
           "WEBD$gDTuta10xebyc4hqIEofSvvviaVBxQPZmD$":-18000000000,
           "WEBD$gA1Pz3fdN1ij9B4Kyg6N88yT8xz8usp@iv$":-3000100000,
           "WEBD$gDv3YLjBxyQ#DRR$6f13g12d2BqXpbJxSD$":-23000000000
        }
}


function getVirtualTransactionsFromForkParsed() {
      let trx = {
        block_number: HARD_FORKS_WALLET_RECOVERY,
        type: 1,
        fee: 0,
        from_amount: GENESIS_AMOUNT_FORK,
        to_amount: GENESIS_AMOUNT_FORK,
        addresses: [GENESIS_ADDRESS_FORK],
        from: {
          trxs: [],
          address: [],
          amount: GENESIS_AMOUNT_FORK,
        },
        to: {
          trxs: [
            {
              trx_to_address: GENESIS_ADDRESS_FORK,
              trx_to_amount: GENESIS_AMOUNT_FORK,
            }
          ],
          address: [GENESIS_ADDRESS_FORK],
          amount: GENESIS_AMOUNT_FORK,
        },
        txId: 'virtual',
        version: -1,
        nonce: -1,
        timeLock: -1,
        timestamp: new Date(GENESIS_ADDRESS_TIMESTAMP).getTime() / 1000
      }

      let trxs = getVirtualTransactionsFromHardFork()
      for (let address in trxs) {
        trx.from.address.push(address)
        trx.addresses.push(address)
        trx.from.trxs.push({
          trx_from_address: address,
          trx_from_amount: -trxs[address],
          trx_from_pub_key: 'virtual',
          trx_from_signature: 'virtual'
        })
      }
      return trx
}

function deserializeNumber(buffer){
  if(buffer.length === 1) return buffer[0]; else
  if (buffer.length === 2) return buffer[1] | (buffer[0] << 8); else
  if (buffer.length === 3) return buffer[2] | (buffer[1] << 8) | (buffer[0] << 16); else
  if (buffer.length === 4) return buffer[3] | (buffer[2] << 8) | (buffer[1] << 16) | (buffer[0] << 24); else
  if (buffer.length === 6) return buffer[5] | (buffer[4] << 8) | (buffer[3] << 16) | (buffer[2] << 24) | (buffer[1] << 32) | (buffer[0] << 40);
}

function substr(buffer, index, count){
  if (count === undefined) {
    count = buffer.length;
  }

  let length = Math.min(index + count, buffer.length);
  if (length-index <= 0) {
    throw {message: "length-index <= 0...", buffer: buffer.toString("hex"), index:index, length:length, count: count};
  }

  let buf = new Buffer(length-index);
  buffer.copy(buf, 0, index, length);
  return buf;
}

function decodeBase64(str) {
  if (typeof str !== "string") throw {message: "input is not string for base decoding", str:str};

  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') newStr +=  'O'; else
    if (str[i] === '@') newStr +=  'l'; else
    if (str[i] === '$') newStr +=  '/';
    else newStr += str[i];
  }
  return (new Buffer(newStr, 'base64'));
}

function encodeBase64(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
  let result = buffer.toString('base64');
  let newStr = '';
  for (let i = 0; i < result.length; i++) {
    if (result[i] === 'O') newStr +=  '#'; else
    if (result[i] === 'l') newStr +=  '@'; else
    if (result[i] === '/') newStr +=  '$';
    else newStr += result[i];
  }
  return newStr;
}

function deserializeNumber8BytesBuffer(buffer, offset = 0) {
  let value = 0;
  for ( let i = offset + 6 ; i >= offset; i--)
    value = (value * 256) + buffer[i];
  return value;
}

function SHA256(bytes) {
  let sha256 = crypto.createHash('sha256'); //sha256
  sha256.update(bytes);
  return sha256.digest();
}

function RIPEMD160(bytes){
  let ripemd160 = crypto.createHash('ripemd160'); // RIPEMD160
  ripemd160.update(bytes);
  return ripemd160.digest();
}

function generateUnencodedAddressFromPublicKey(publicKey) {
  return RIPEMD160(SHA256(publicKey));
}

function generateAddressFromPublicKey(publicKey) {
  let unencodedAddress = generateUnencodedAddressFromPublicKey(Buffer.from(publicKey, 'hex'));
  return decodeMinerAddress(unencodedAddress.toString('hex'));
}

function decodeMinerAddress(miner_address) {
    var address = Buffer.concat([Buffer.from('00', "hex"), Buffer.from(miner_address, 'hex')])
    var checksum = SHA256(SHA256(address))
    checksum = substr(checksum, 0, 4)
    return encodeBase64(Buffer.concat([ Buffer.from(PREFIX_BASE64, 'hex'), address, checksum, Buffer.from(SUFFIX_BASE64, 'hex')]))
}

function decodeRawBlock(block_id, block_hex, divide_amounts) {
      const AMOUNT_DIVIDER = 10000
      var amountDivider = 1
      if (divide_amounts) {
        amountDivider = AMOUNT_DIVIDER
      }
      var total_fee = 0
      var addresses = []

      var base_reward = BASE_REWARD * AMOUNT_DIVIDER
      if (block_id < FIRST_BLOCK_REWARDS.length) {
        base_reward = FIRST_BLOCK_REWARDS[block_id] * AMOUNT_DIVIDER
      }
      const OFFSET_1 = 1
      const OFFSET_2 = 2
      const OFFSET_3 = 3
      const OFFSET_4 = 4
      const OFFSET_7 = 7
      const OFFSET_20 = 20
      const OFFSET_32 = 32
      const OFFSET_64 = 64

      var OFFSET_BLOCK_HASH = OFFSET_32
      var OFFSET_BLOCK_NONCE = OFFSET_4
      var OFFSET_BLOCK_VERSION = OFFSET_2
      var OFFSET_BLOCK_TIMESTAMP = OFFSET_4
      var OFFSET_ADDRESS = OFFSET_20
      var OFFSET_TRX_NUMBER = OFFSET_4

      var CURRENT_OFFSET = 0
      var block_hash = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var block_nonce = parseInt(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_NONCE).toString('hex'), 16)
      CURRENT_OFFSET += OFFSET_BLOCK_NONCE
      var block_version = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_VERSION))
      CURRENT_OFFSET += OFFSET_BLOCK_VERSION
      var block_hashPrev = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var block_timestamp = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_TIMESTAMP)) + 1524742312
      CURRENT_OFFSET += OFFSET_BLOCK_TIMESTAMP
      var human_timestamp = block_timestamp

      // Secondary data
      var block_hash_data = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var miner_address = substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex')
      CURRENT_OFFSET += OFFSET_ADDRESS
      var miner_address_decoded = decodeMinerAddress(miner_address)
      addresses.push(miner_address_decoded)

      // TRX data
      var trxs_hash_data = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var trxs_number = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_NUMBER))
      CURRENT_OFFSET += OFFSET_TRX_NUMBER
      var total_from_amount = 0
      var total_to_amount = 0

      var trxs_container = []
      if (trxs_number > 0) {
        for(var i=0;i<trxs_number;i++) {
          var trx_addresses = []
          var OFFSET_TRX_VERSION = OFFSET_1
          var OFFSET_TRX_NONCE = OFFSET_1
          var OFFSET_TRX_LENGTH = OFFSET_1
          var OFFSET_TRX_NONCE_V2 = OFFSET_2
          var OFFSET_TRX_TIME_LOCK = OFFSET_3
          var OFFSET_TRX_PUB_KEY = OFFSET_32
          var OFFSET_TRX_SIGN = OFFSET_64
          var OFFSET_NUMBER = OFFSET_7
          
          var trx_version = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_VERSION))
          CURRENT_OFFSET += OFFSET_TRX_VERSION
          // HARD FORK change for TRX NONCE
          if (block_id > TRX_NONCE_V2_BLOCK) {
            OFFSET_TRX_NONCE = OFFSET_TRX_NONCE_V2
          }
          var trx_nonce = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_NONCE))
          CURRENT_OFFSET += OFFSET_TRX_NONCE

          var trx_time_lock = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_TIME_LOCK))
          CURRENT_OFFSET += OFFSET_TRX_TIME_LOCK

          // Deserialize from trx data
          var trx_from_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH

          if (trx_from_length < 0) {
              console.log("trx_from_length should be greater than 0.")
              continue
          }
          var trxs_from = {
            'trxs': [],
            'address': [],
            'amount': 0,
          }
          for (var from_address_index=0;from_address_index<trx_from_length; from_address_index++) {
            var trx_from = {
              'trx_from_address': '',
              'trx_from_pub_key': '',
              'trx_from_signature': '',
              'trx_from_amount': 0
            }
            if (trx_version <= 1) {
              trx_from.trx_from_address = decodeMinerAddress(substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex'))
              CURRENT_OFFSET += OFFSET_ADDRESS
            }

            trx_from.trx_from_pub_key = substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_PUB_KEY).toString('hex')
            CURRENT_OFFSET += OFFSET_TRX_PUB_KEY
            trx_from.trx_from_address = generateAddressFromPublicKey(trx_from.trx_from_pub_key)
            trxs_from.address.push(trx_from.trx_from_address)
            if (addresses.indexOf(trx_from.trx_from_address) == -1) {
              addresses.push(trx_from.trx_from_address)
            }
            if (trx_addresses.indexOf(trx_from.trx_from_address) == -1) {
              trx_addresses.push(trx_from.trx_from_address)
            }
            trx_from.trx_from_signature = substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_SIGN).toString('hex')
            CURRENT_OFFSET += OFFSET_TRX_SIGN
            trx_from.trx_from_amount = deserializeNumber8BytesBuffer(block_hex, CURRENT_OFFSET)
            trxs_from.amount += trx_from.trx_from_amount
            CURRENT_OFFSET += OFFSET_NUMBER
            trxs_from.trxs.push(trx_from)
          }
          var trx_from_currency_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH
          var trx_from_currency_token = substr(block_hex, CURRENT_OFFSET, trx_from_currency_length).toString('hex')
          CURRENT_OFFSET += trx_from_currency_length

          // Deserialize to trx data
          var trx_to_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH

          var trxs_to = {
            'trxs': [],
            'address': [],
            'amount': 0
          }
          for (var to_address_index=0; to_address_index<trx_to_length; to_address_index++) {
            var trx_to = {
              'trx_to_address': '',
              'trx_to_amount': 0
            }

            trx_to.trx_to_address = decodeMinerAddress(substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex'))
            trxs_to.address.push(trx_to.trx_to_address)
            if (addresses.indexOf(trx_to.trx_to_address) == -1) {
              addresses.push(trx_to.trx_to_address)
            }
            if (trx_addresses.indexOf(trx_to.trx_to_address) == -1) {
              trx_addresses.push(trx_to.trx_to_address)
            }
            CURRENT_OFFSET += OFFSET_ADDRESS

            trx_to.trx_to_amount = deserializeNumber8BytesBuffer(block_hex, CURRENT_OFFSET)
            trxs_to.amount += trx_to.trx_to_amount
            CURRENT_OFFSET += OFFSET_NUMBER
            trxs_to.trxs.push(trx_to)
          }

          var fee = trxs_from.amount - trxs_to.amount
          total_fee += fee
          total_from_amount += trxs_from.amount
          total_to_amount += trxs_to.amount

          var trx = {
              'version' : trx_version,
              'nonce' : trx_nonce,
              'time_lock' : trx_time_lock,
              'from': trxs_from,
              'to': trxs_to,
              'from_amount': trxs_from.amount,
              'to_amount': trxs_to.amount,
              'fee': fee,
              'block_number': block_id,
              'timestamp': human_timestamp,
              'addresses': trx_addresses,
              'type': 0
          }
          trxs_container.push(trx)
        }
      }
      block_id = parseInt(block_id)
      if (block_id == HARD_FORKS_WALLET_RECOVERY) {
        let virtual_trx = getVirtualTransactionsFromForkParsed()
        trxs_container.push(virtual_trx)
        addresses = virtual_trx.addresses
        total_from_amount = virtual_trx.from_amount
        total_to_amount = virtual_trx.to_amount
        console.log("Virtual transaction has been added")
      }
      return {
        'number' : block_id,
        'hash' : block_hash,
        'nonce' : block_nonce,
        'version' : block_version,
        'previous_hash' : block_hashPrev,
        'timestamp' : human_timestamp,
        'miner' : miner_address_decoded,
        'trxs_number': trxs_container.length,
        'from_amount': total_from_amount,
        'to_amount': total_to_amount,
        'fee': total_fee,
        'addresses': addresses,
        'base_reward': base_reward,
        'reward': base_reward + total_fee,
        'trxs': trxs_container
      }
}


class MongoSavingManager{

    constructor() {
    }

    async saveBlock(key, data) {
      logger.log({
        level: 'info',
        message: 'Syncing...'
      });

      let mongoDB = await MongoClient.connect(mongodbUrl, { useNewUrlParser: true })
      logger.log({
        level: 'info',
        message: 'MongoDB connection created'
      });
      try {
      let blockChainDB = mongoDB.db(mongodbBlockchainDB);

      // Create indexes for block collection
      await blockChainDB.createCollection(mongodbBlockCollection)
      await blockChainDB.collection(mongodbBlockCollection).createIndex(
        { number: 1 },
        { unique: true }
      )
      await blockChainDB.collection(mongodbBlockCollection).createIndex(
         { hash: 1 },
         { unique: true }
      )
      await blockChainDB.collection(mongodbBlockCollection).createIndex(
         { miner: 1 },
         { unique: false }
      )
      await blockChainDB.collection(mongodbBlockCollection).createIndex(
         { addresses: 1 },
         { unique: false }
      )
      await blockChainDB.collection(mongodbBlockCollection).createIndex(
          { number: 1, hash: 1 },
          { unique: false }
      )

  // Create indexes for transaction collection
  await blockChainDB.createCollection(mongodbTransactionCollection)
  await blockChainDB.collection(mongodbTransactionCollection).createIndex(
    { block_number: 1 }
  )
  await blockChainDB.collection(mongodbTransactionCollection).createIndex(
    { timestamp: 1 }
  )
  await blockChainDB.collection(mongodbTransactionCollection).createIndex(
    { addresses: 1 }
  )

  // Create indexes for mtransaction collection
  await blockChainDB.createCollection(mongodbMTransactionCollection)
  await blockChainDB.collection(mongodbMTransactionCollection).createIndex(
    { block_number: 1 }
  )
  await blockChainDB.collection(mongodbMTransactionCollection).createIndex(
    { address: 1 }
  )
  await blockChainDB.collection(mongodbMTransactionCollection).createIndex(
    { type: 1 }
  )

      let decoded_block = decodeRawBlock(key, data)
      let badBlocks = await blockChainDB.collection(mongodbBlockCollection).find({
        number: decoded_block.number,
        hash: { $ne: decoded_block.hash }
      }).toArray()
      if (badBlocks.length > 0) {
        logger.log({
          level: 'info',
          message: 'Removing bad blocks'
        })
        await blockChainDB.collection(mongodbBlockCollection).deleteMany({ number: decoded_block.number})
        await blockChainDB.collection(mongodbTransactionCollection).deleteMany({ block_number: decoded_block.number})
        await blockChainDB.collection(mongodbMTransactionCollection).deleteMany({ block_number: decoded_block.number})
      }

      let goodBlock = await blockChainDB.collection(mongodbBlockCollection).find({
        number: decoded_block.number,
        hash: decoded_block.hash
      }).toArray()
      if (goodBlock.length == 0) {
        logger.log({
          level: 'info',
          message: decoded_block
        });
        if (decoded_block.trxs.length > 0) {
          for(let i=0; i<decoded_block.trxs.length;i++) {
            let full_trx = decoded_block.trxs[i]
            let trxs_to = full_trx.to.trxs
            let trxs_from = full_trx.from.trxs
            await blockChainDB.collection(mongodbTransactionCollection).insertOne(decoded_block.trxs[i])
            for (let j=0; j<trxs_from.length; j++) {
              await blockChainDB.collection(mongodbMTransactionCollection).insertOne({
                block_number: full_trx.block_number,
                address: trxs_from[j].trx_from_address,
                type: 0,
                nonce: full_trx.nonce,
                amount: trxs_from[j].trx_from_amount,
              })
            }
            for (let j=0; j<trxs_to.length; j++) {
              await blockChainDB.collection(mongodbMTransactionCollection).insertOne({
                block_number: full_trx.block_number,
                address: trxs_to[j].trx_to_address,
                type: 1,
                nonce: full_trx.nonce,
                amount: trxs_to[j].trx_to_amount,
              })
            }
          }
        }
        delete decoded_block.trxs
        await blockChainDB.collection(mongodbBlockCollection).insertOne(decoded_block)
      } else {
        logger.log({
          level: 'info',
          message: 'Block ' + decoded_block.number + ' is already in the db'
        });
      }
    } catch (ex) {
    } finally {
      mongoDB.close()
    }
    }
}


export default MongoSavingManager;
