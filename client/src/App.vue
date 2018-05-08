<template>
  <div id="app" style="width:720px;">
    <h2 id="website-name"> <a href="#/"> Webdollar Network </a></h2>
    <router-view/>
    <h5 id="contribute" style="float:left; width:100%"> Throw a web$ to help webdollar.network get better: <a href="#/miner/WEBD$gB0i257JiEMLsMIeLghM+7huKrsujc6@@7$" class="">WEBD$gB0i257JiEMLsMIeLghM+7huKrsujc6@@7$</a></h5>
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
