<template>

  <div class="topnav" id="menu">

    <a href="javascript:void(0);" style="font-size:15px;" class="icon showMenu" @click="this.showMobileMenu" :class="mobileMenuOpened ? 'openedMenuLink' : '' ">&#9776;</a>

    <div class="dropDown" :style="{display: (mobileMenuOpened) ? 'block':'none'}">

      <router-link to="/today" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">WEBD Today</div>
      </router-link>

      <router-link to="/pools" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">Pools</div>
      </router-link>

      <router-link to="/genesis" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">Genesis</div>
      </router-link>

      <router-link to="/old-genesis" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">OldGenesis</div>
      </router-link>

      <router-link to="/fame" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">Hall of Fame</div>
      </router-link>

      <router-link to="/pending_trx" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' ">
        <div v-on:click="this.collapseMenuBack">Pending Transactions</div>
      </router-link>

      <a href="https://webdollar.io" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' " target="_blank" >
        <div v-on:click="this.collapseMenuBack">WebDollar</div>
      </a>

      <a href="https://www.webdscan.io" :class="this.mobileMenuOpened && this.isMobile ? 'openedMenuLink' : '' " target="_blank" >
        <div v-on:click="this.collapseMenuBack">webdscan.io</div>
      </a>

    </div>

  </div>

</template>

<script>

import BlocksService from '@/services/BlocksService'

export default {

  name: "HeaderLayout",

  components: {},

  data() {
    return {
      screenWidth: 0,
      alertsHeight: 0,
      mobileMenuOpened: false,
      isMobile: true,
      alerts: [
        {
          message: 'test text'
        }, {
          message: 'test text 2'
        }
      ]
    }
  },

  methods: {

    collapseMenuBack() {

      this.mobileMenuOpened = false;

    },

    showMobileMenu() {

      this.mobileMenuOpened = !this.mobileMenuOpened;

    },

    verifyIfIsMobile() {

//      if (this.screenWidth < 768) {
//
//        this.isMobile = true;
//
//      } else {
//
//        this.isMobile = false;
//
//      }

    },

    addEvent(object, type, callback) {
      if (object === null || typeof(object) === 'undefined') return;
      if (object.addEventListener) {
        object.addEventListener(type, callback, false);
      } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
      } else {
        object["on" + type] = callback;
      }
    }

  },

  mounted() {

    if (typeof window === 'undefined') return;

    this.addEvent(window, "resize", (event) => {

      this.screenWidth = window.innerWidth;
      this.verifyIfIsMobile();

    });

    this.addEvent(window, "scroll", (event) => {

      if (this.mobileMenuOpened == true) {
        this.mobileMenuOpened = false;
      }

    });

    this.screenWidth = window.innerWidth;
    this.verifyIfIsMobile();

  }

}
</script>

<style>

  .showMenu{
    padding: 26px 20px;
    color: #fff!important;
    background-color: #424242;
    transition: all 0.5s ease;
  }

  .showMenu:hover{
    color: #fec02c!important;
    background-color: #2d2d2d;
    transition: all 0.5s ease;
  }

  .dropDown{
    display: block;
    position: absolute;
    background-color: #fec02c;
    right: 0;
    width: 313px;
  }

</style>
