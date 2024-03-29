<template>
    <div v-if="visible" class="lightbox-backdrop" @click.self="close">
      <div class="lightbox-content">
        <slot></slot>
        <!-- Your survey form will go here -->
        <p>Survey form for dining halls will be placed here.</p>
        <button @click="close">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      open() {
        this.visible = true;
      },
      close() {
        this.visible = false;
      },
    },
  };
  </script>
  
  <style>
  .lightbox-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .lightbox-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    text-align: center;
  }
  </style>
  