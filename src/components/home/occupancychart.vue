<template>
    <div class="occupancy-chart">
        <div v-for="(dataPoint, index) in data" :key="index" class="bar">
            <div class="label">{{ dataPoint.label }}</div>
            <div class="bar-wrapper">
                <div class="bar-fill" :style="{ width: dataPoint.value + '%'}"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        data:{
            type: Array
            required: true
        }
    }
};
</script>

<style scoped>
.occupany-chart {
    display: flex;
    flex-direction: column;
}

.bar {
    margin-bottom: 10px;
    display: flex;
    align-items:center;
}

.label {
    width: 100px;
}

.bar-wrapper {
    width: 200px;
    height: 200px;
    background-color: lightgray;
    border-radius: 5px;
}

.bar-fill{
    height: 100%;
    border-radius: 5px;
    background-color: #007bff;
}
</style>