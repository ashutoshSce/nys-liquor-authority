<template>
  <div id="app">
    <h1>
      <strong>New York State Liquor Authority</strong>
    </h1>
    <nys-liquor-datatable style="margin-top:1rem;" />
  </div>
</template>

<script>
import NysLiquorDatatable from './pages/nysLiquorDatatable';

export default {
  name: 'App',
  components: {
    NysLiquorDatatable,
  },
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 1rem;
}
</style>
