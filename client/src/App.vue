<template>
  <div id="app" style="width:600px;">
    <h2 id="website-name"> <a href="#/"> WebDollar Network </a></h2>
    <router-view/>
    <p id="contribute" style="margin: 20px 0px 10px 0px; height:5px;font-size: 10px; float:left; width:100%"> <center>Throw a web$ to help webdollar.network get better: <a href="#/miner/WEBD$gC1JvBisEYBCPEfT8rJf6B$$kBdeJHFBtz$" class="">WEBD$gC1JvBisEYBCPEfT8rJf6B$$kBdeJHFBtz$</a></center></p>
    <p style="float:left;font-size: 10px; margin:5px 0px 5px 0px; width:100%"> <center>The owner of this website disclaims any liability in connection with the integrity and use of this information.</center></p>
    <p style="margin:5px 0px 5px 0px;font-size: 10px;float:left; width:100%;height: 5px;"> <center>Found a bug? Report it <a href="https://github.com/thelazyprogrammer/webdollar-explorer-api">here</a>. Copyright <a href="http://lazyprogrammer.io">@lazyprogrammer.io</a> 2018</center></p>
  </div>  
</template>

<script>
export default {
  name: 'App'
}
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

<style>
#app {
  width: 700px;
  float: relative;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#website-name {
  float: left;
  width: 100%;
}
#contribute {
  float: left;
  width: 100%;
}
</style>
