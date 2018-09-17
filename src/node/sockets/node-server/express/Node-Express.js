import BlockchainGenesis from 'common/blockchain/global/Blockchain-Genesis'
import InterfaceBlockchainAddressHelper from "common/blockchain/interface-blockchain/addresses/Interface-Blockchain-Address-Helper";

const https = require('https');
const compression = require('compression');
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');

import consts from 'consts/const_global'

import NodeAPIRouter from "../API-router/Node-API-Router"
import NODE_API_TYPE from "../API-router/NODE_API_TYPE";

import NodeServerSocketAPI from "../sockets/Node-Server-Socket-API"; //required because it will process the SocketAPI



import Blockchain from "main-blockchain/Blockchain"
import NodesList from 'node/lists/Nodes-List'
import WebDollarCoins from "common/utils/coins/WebDollar-Coins"

var BigNumber = require ('bignumber.js');

const GENESIS_ADDRESS_FORK = 'WEBD$gDZwjjD7ZE5+AE+44ITr8yo5E2aXYT3mEH$'
const GENESIS_ADDRESS_TIMESTAMP = 'Wed, 11 Jul 2018 11:19:52 GMT'


class NodeExpress{

    constructor(){

        this.loaded = false;
        this.app = undefined;

        this.SSL = false;
        this.port = 0;
        this.domain = '';

    }

    _extractDomain( fileName ){

        const x509 = require('x509');
        let subject = x509.getSubject( fileName );

        let domain = subject.commonName;

        if (domain === undefined) domain = '';

        domain = domain.replace( "*.", "" );

        return domain;
    }

    _getVirtualTransactionsFromHardFork() {
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

    _getVirtualTransactionsFromForkParsed() {
      let trx = {
        block_id: consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY,
        id: consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY,
        confirmed: true,
        type: 'virtual',
        fee: 0,
        from: {
          address: [],
          addresses: [],
          amount: 18674856891922,
          currencyTokenId: '01'
        },
        to: {
          address: [GENESIS_ADDRESS_FORK],
          addresses: [{
            address: GENESIS_ADDRESS_FORK,
            amount: '18674856891922'
          }],
        },
        txId: 'virtual',
        version: -1,
        nonce: -1,
        timeLock: -1,
        timestamp: GENESIS_ADDRESS_TIMESTAMP
      }

      let from_address = []
      let from_addresses = []
      let trxs = this._getVirtualTransactionsFromHardFork()
      for (let address in trxs) {
        from_address.push(address)
        from_addresses.push({
          address: address,
          amount: (-trxs[address]).toString(),
          publicKey: GENESIS_ADDRESS_FORK,
          signature: 'virtual'
        })
      }
      trx.from.address = from_address
      trx.from.addresses = from_addresses
      return trx
    }

    _serializeBlock(raw_block) {
      let timestamp = new Date((raw_block.timeStamp + BlockchainGenesis.timeStamp) * 1000)
      timestamp = timestamp.toUTCString()
      let transactions = []
      if (raw_block.data.transactions && raw_block.data.transactions.transactions) {
        for (let j = 0; j < raw_block.data.transactions.transactions.length; j++) {
          transactions.push(raw_block.data.transactions.transactions[j].toJSON())
        }
      }
      if (raw_block.height == consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY) {
        transactions.push(this._getVirtualTransactionsFromForkParsed())
      }

      let block = {
        id:            raw_block.height,
        block_id:      raw_block.height,
        miner_address: raw_block.data.minerAddress.toString('hex'),
        nonce:         raw_block.nonce,
        hash:          raw_block.hash.toString('hex'),
        previous_hash: raw_block.hashPrev.toString('hex'),
        timestamp:     timestamp,
        raw_timestamp: raw_block.timeStamp,
        reward:        raw_block.reward,
        trxs:          transactions,
        trxs_number:   transactions.length,
        version:       raw_block.version
      }
      return block
    }

    startExpress(){

        if (this.loaded) //already open
            return;

        return new Promise((resolve)=>{

            this.app = express();
            this.app.use(cors({ credentials: true }));
            this.app.use(compression());

            try {
                this.app.use('/.well-known/acme-challenge', express.static('certificates/well-known/acme-challenge'))
            } catch (exception){

                console.error("Couldn't read the SSL certificates");

            }

            let options = {};

            this.port = process.env.PORT || process.env.SERVER_PORT || consts.SETTINGS.NODE.PORT;

            this.loaded = true;

            try {

                if (!consts.SETTINGS.NODE.SSL) throw {message: "no ssl"};

                this.domain = process.env.DOMAIN;

                let privateKey='', privateKeys = ["private.key","privateKey","private.crt"];
                for (let i=0; i<privateKeys.length; i++)
                    if (fs.existsSync(`./certificates/${privateKeys[i]}`)){
                        privateKey = `./certificates/${privateKeys[i]}`;
                        break;
                    }

                let cert = '', certificates = ["certificate.crt", "crt.crt", "certificate"];
                for (let i=0; i<certificates.length; i++)
                    if (fs.existsSync(`./certificates/${certificates[i]}`)){
                        cert = `./certificates/${certificates[i]}`;
                        break;
                    }

                let caBundle = '', certificateBundles = ["ca_bundle.crt", "bundle.crt", "ca_bundle"];
                for (let i=0; i<certificateBundles.length; i++)
                    if (fs.existsSync(`./certificates/${certificateBundles[i]}`)){
                        caBundle = `./certificates/${certificateBundles[i]}`;
                        break;
                    }

                if (privateKey === '' && cert === '' && caBundle === '') throw {message: "HTTPS server couldn't be started. Starting HTTP"};            
                if (privateKey === '') throw {message: "HTTPS server couldn't be started because certificate private.key was not found"};
                if (cert === '') throw {message: "HTTPS server couldn't be started because certificate certificate.crt was not found"};
                if (caBundle === '') throw {message: "HTTPS server couldn't be started because certificate ca_bundle.crt was not found"};

                try {
                    if (this.domain === undefined || this.domain === "undefined") this.domain = this._extractDomain(cert);
                } catch (exception){
                    console.error("Couldn't determine the SSL Certificate Host Name");
                }

                options.key = fs.readFileSync(privateKey, 'utf8');
                options.cert = fs.readFileSync(cert, 'utf8');
                options.caBundle = fs.readFileSync(caBundle, 'utf8');

                this.server = https.createServer(options, this.app).listen( this.port, ()=>{

                    console.info("========================================");
                    console.info("SSL certificate found for ", this.domain||'domain.com');

                    if (this.domain === '')
                        console.error("Your domain from certificate was not recognized");


                    this.SSL = true;

                    this._initializeRouter(this.app);

                    console.info("========================================");
                    console.info("HTTPS Express was opened on port "+ this.port);
                    console.info("========================================");

                    resolve(true);

                }).on('error',  (err) => {

                    console.error("Error Creating HTTPS Express Server");
                    console.error(err);

                    throw err;

                });

            } catch (exception){

                console.error("HTTP Express raised an error", exception);

                //cloudflare generates its own SSL certificate
                this.server = http.createServer(this.app).listen(this.port, () => {

                    this.domain = 'my-ip';

                    console.info("========================================");
                    console.info(`Express started at localhost: ${this.port}`);
                    console.info("========================================");

                    consts.SETTINGS.PARAMS.CONNECTIONS.TERMINAL.SERVER.MAXIMUM_CONNECTIONS_FROM_TERMINAL = consts.SETTINGS.PARAMS.CONNECTIONS.TERMINAL.SERVER.MAXIMUM_CONNECTIONS_FROM_TERMINAL + consts.SETTINGS.PARAMS.CONNECTIONS.TERMINAL.SERVER.MAXIMUM_CONNECTIONS_FROM_BROWSER;

                    this._initializeRouter(this.app);

                    resolve(true);

                }).on('error', (err) => {

                    this.domain = '';

                    console.error("Error Creating Express Server");
                    console.error(err);

                    resolve(false);

                });


            }

        })
    }

    _initializeRouter(app){
// respond with "hello world" when a GET request is made to the homepage
        this.app.get('/', (req, res) => {

            let lastBlock = Blockchain.blockchain.blocks.last;

            res.json({

                protocol: consts.SETTINGS.NODE.PROTOCOL,
                version: consts.SETTINGS.NODE.VERSION,
                blocks: {
                    length: Blockchain.blockchain.blocks.length,
                    lastBlockHash: lastBlock !== undefined ? Blockchain.blockchain.blocks.last.hash.toString("hex") : '',
                },
                networkHashRate: Blockchain.blockchain.blocks.networkHashRate,
                sockets:{
                },
                waitlist:{
                }

            });

        });

        // Return virtual transactions from fork
        this.app.get('/fork-trxs', (req, res) => {
          res.send({result: true, trxs: this._getVirtualTransactionsFromForkParsed()})
        })

        // Return blocks information
        this.app.get('/blocks/:blocks', (req, res) => {

          try {
            let block_start = parseInt(decodeURIComponent(req.params.blocks))
            if (block_start < Blockchain.blockchain.blocks.length) {
              let blocks_to_send = []
              for (let i=Blockchain.blockchain.blocks.length - block_start; i<Blockchain.blockchain.blocks.length; i++) {
                blocks_to_send.push(this._serializeBlock(Blockchain.blockchain.blocks[i]))
              }
              res.send({result: true, blocks: blocks_to_send})
              return
            } else {
              throw ("block start is not correct: " + block_start)
            }
          } catch (exception) {
            res.send({result: false, message: exception.message});
            return;
          }
        })


        // Return block information
        this.app.get('/block/:block', (req, res) => {
          try {
            let block = parseInt(decodeURIComponent(req.params.block))
            if (block < Blockchain.blockchain.blocks.length) {
              res.send({
                result: true,
                block: this._serializeBlock(Blockchain.blockchain.blocks[block])
              })
              return;
            } else {
              throw "Block not found."
            }
          } catch (exception) {
            res.send({result: false, message: "Invalid Block"})
            return;
          }
        })


        // Return block information
        this.app.get('/pending_trx', (req, res) => {
          try {
              let transactions = []
              if (Blockchain.blockchain.transactions.pendingQueue.list) {
                Blockchain.blockchain.transactions.pendingQueue.list.forEach(function(trx) {
                  transactions.push(trx.toJSON())
                })
              }
              res.send({
                result: true,
                trxs: transactions,
                trxs_number: transactions.length,
              })
              return;
          } catch (exception) {
            res.send({result: false, message: "Invalid request"})
            return;
          }
        })


        // Return address info: balance, blocks mined and transactions
        this.app.get('/address/:address', (req, res) => {
            let address = decodeURIComponent(req.params.address);
            let address_raw = address
            try {
                address = InterfaceBlockchainAddressHelper.getUnencodedAddressFromWIF(address);
            } catch (exception){
                res.send({result: false, message: "Invalid Address"});
                return;
            }

            let answer = []
            let minedBlocks = []
            let balance = 0
            let last_block = Blockchain.blockchain.blocks.length
            try {
              // Get balance
              balance = Blockchain.blockchain.accountantTree.getBalance(address, undefined);
              balance = (balance === null) ? 0 : (balance / WebDollarCoins.WEBD);
            } catch(exception) {
                console.log(exception.message)
                res.send({result: false, message: "Invalid Address"});
                return;
            }
            try {
            // Get mined blocks and transactions
            for (let i=0; i<Blockchain.blockchain.blocks.length; i++) {
                let trxs_number = 0
                if (Blockchain.blockchain.blocks[i].data.transactions && Blockchain.blockchain.blocks[i].data.transactions.transactions) {
                    trxs_number = Blockchain.blockchain.blocks[i].data.transactions.transactions.length
                }

                for (let j = 0; j < trxs_number; j++) {

                    let transaction = Blockchain.blockchain.blocks[i].data.transactions.transactions[j];

                    let found = false;
                    for (let q = 0; q < transaction.from.addresses.length; q++)
                        if (transaction.from.addresses[q].unencodedAddress && transaction.from.addresses[q].unencodedAddress.equals(address)) {
                            found = true;
                            break;
                        }

                    for (let q = 0; q < transaction.to.addresses.length; q++)
                        if (transaction.to.addresses[q].unencodedAddress && transaction.to.addresses[q].unencodedAddress.equals(address)) {
                            found = true;
                            break;
                        }

                    if (found) {
                        answer.push(
                            {
                                blockId: Blockchain.blockchain.blocks[i].height,
                                timestamp: Blockchain.blockchain.blocks[i].timeStamp + BlockchainGenesis.timeStamp,
                                transaction: transaction.toJSON()
                            });
                    }

                }

                if (Blockchain.blockchain.blocks[i].height == consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY && (address_raw == GENESIS_ADDRESS_FORK || this._getVirtualTransactionsFromHardFork().hasOwnProperty(address_raw))) {
                  answer.push({
                    blockId: consts.BLOCKCHAIN.HARD_FORKS.WALLET_RECOVERY,
                    timestamp: Blockchain.blockchain.blocks[i].timeStamp + BlockchainGenesis.timeStamp,
                    transaction: this._getVirtualTransactionsFromForkParsed()
                  })
                }
                if (Blockchain.blockchain.blocks[i].data.minerAddress.equals(address)) {
                    minedBlocks.push(
                        {
                            blockId: Blockchain.blockchain.blocks[i].height,
                            timestamp: Blockchain.blockchain.blocks[i].timeStamp + BlockchainGenesis.timeStamp,
                            transactions: trxs_number
                        });
                }
            }
            } catch (ex) {
                console.log(ex.message)
            }


            res.send({result: true, last_block: last_block,
                      balance: balance, minedBlocks: minedBlocks,
                      transactions: answer
                     });

        });

        //Get Address
        //TODO: optimize or limit the number of requests
        this.app.get('/wallets/balance/:address', (req, res) => {

            let address = decodeURIComponent(req.params.address);
            let balance = Blockchain.blockchain.accountantTree.getBalance(address, undefined);

            balance = (balance === null) ? 0 : (balance / WebDollarCoins.WEBD);

            res.json(balance);

        });

        if (process.env.WALLET_SECRET_URL && typeof process.env.WALLET_SECRET_URL === "string" && process.env.WALLET_SECRET_URL.length >= 30) {

            this.app.get('/'+process.env.WALLET_SECRET_URL+'/mining/balance', (req, res) => {

                let addressString = Blockchain.blockchain.mining.minerAddress;
                let balance = Blockchain.blockchain.accountantTree.getBalance(addressString, undefined);

                balance = (balance === null) ? 0 : (balance / WebDollarCoins.WEBD);

                res.json(balance);

            });

            this.app.get('/'+process.env.WALLET_SECRET_URL+'/wallets/import', async (req, res) => {

                let content = {
                    version: '0.1',
                    address: decodeURIComponent(req.query.address),
                    publicKey: req.query.publicKey,
                    privateKey: req.query.privateKey
                };

                try {

                    let answer = await Blockchain.Wallet.importAddressFromJSON(content);

                    if (answer.result === true) {
                        console.log("Address successfully imported", answer.address);
                        await Blockchain.Wallet.saveWallet();
                        res.json(true);
                    } else {
                        console.error(answer.message);
                        res.json(false);
                    }

                } catch(err) {
                    console.error(err.message);
                    res.json(false);
                }

            });

            this.app.get('/'+process.env.WALLET_SECRET_URL+'/wallets/transactions', async (req, res) => {

              let from = decodeURIComponent(req.query.from);
              let to = decodeURIComponent(req.query.to);
              let amount = parseInt(req.query.amount) * WebDollarCoins.WEBD;
              let fee = parseInt(req.query.fee) * WebDollarCoins.WEBD;

              let result = await Blockchain.Transactions.wizard.createTransactionSimple(from, to, amount, fee);

              res.json(result);

            });

          this.app.get('/'+process.env.WALLET_SECRET_URL+'/wallets/export', async (req, res) => {
              let addressString = Blockchain.blockchain.mining.minerAddress;
              let answer = await Blockchain.Wallet.exportAddressToJSON(addressString);

              if (answer.data) {
                res.json(answer.data);
              } else {
                res.json({});
              }
          });

        }

        // respond with "hello world" when a GET request is made to the homepage
        this.app.get('/hello', (req, res) => {
            res.send('world');
        });

        // respond with "hello world" when a GET request is made to the homepage
        this.app.get('/ping', (req, res) => {
            res.json( { ping: "pong" });
        });

    }


    amIFallback(){

        for (let i=0; i<NodesWaitlist.waitListFullNodes.length; i++)
            if (NodesWaitlist.waitListFullNodes[i].isFallback && NodesWaitlist.waitListFullNodes[i].sckAddresses[0].address === this.domain)
                return true;

        return false;

    }

    //this will process the params
    async _expressMiddleware(req, res, callback){

        try {
            for (let k in req.params)
                req.params[k] = decodeURIComponent(req.params[k]);

            let merged = req.body ? Object.assign(req.params, req.body) : req.params;
            
            let answer = await callback(merged, res);
            res.json(answer);

        } catch (exception){
            res.json({result:false, message: exception.message});
        }

    }

    async _expressMiddlewareCallback(req, res, callback){

        try {
            for (let k in req)
                req[k] = decodeURIComponent(req[k]);

            let url = req.url;

            if (typeof url !== "string") throw {message: "url not specified"};

            let answer = await callback(req, res, (data)=>{ this._notifyHTTPSubscriber(url, data) });
            res.json(answer);

        } catch (exception){
            res.json({result:false, message: exception.message});
        }

    }

    _notifyHTTPSubscriber(url, data){

        //TODO notify via http get/post via axios ?

    }

}

export default new NodeExpress();
