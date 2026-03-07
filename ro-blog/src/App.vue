<script setup lang="ts">
import { RouterView } from 'vue-router'
import navbar from './components/navbar.vue'
</script>

<template>
  <div class="app-container">
    <navbar />
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
}
</style>
