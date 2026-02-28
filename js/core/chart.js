// -----------------------------
// Dashboard Chart
// -----------------------------

import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/auto/+esm";
import { fetchSymptomLogs, fetchMedicationLogs } from "../services/logs.js";

// Custom plugin to draw medication reference lines
const medicationLinesPlugin = {
    id: "medicationLines",
    afterDraw(chart) {
        const medicationTimes = chart.medicationTimes;
        if (!medicationTimes || medicationTimes.length === 0) return;

        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;

        medicationTimes.forEach((time) => {
            const xPixel = xScale.getPixelForValue(time);

            ctx.save();
            ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(xPixel, yScale.getPixelForValue(yScale.max));
            ctx.lineTo(xPixel, yScale.getPixelForValue(yScale.min));
            ctx.stroke();
            ctx.restore();

            // Optional: Draw label
            ctx.save();
            ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
            ctx.font = "12px Arial";
            ctx.fillText("Med", xPixel - 15, yScale.getPixelForValue(yScale.max) - 10);
            ctx.restore();
        });
    }
};

Chart.register(medicationLinesPlugin);

const chartInstances = {
    tremorChart: null,
    stiffnessChart: null,
    movementChart: null
};

export async function renderDashboard() {

    const medicationLogs = await fetchMedicationLogs();
    const logs = await fetchSymptomLogs();

    // Filter logs that have resolved timestamps
    const validLogs = logs.filter(log => log.timestamp);
    const validMedicationLogs = medicationLogs.filter(log => log.timestamp);

    const medicationTimes = validMedicationLogs.map(log =>
        log.timestamp.toDate().getTime()
    );

    const tremorData = validLogs.map(log => ({
        x: log.timestamp.toDate().getTime(),
        y: log.tremor
    }));

    const stiffnessData = validLogs.map(log => ({
        x: log.timestamp.toDate().getTime(),
        y: log.stiffness
    }));

    const movementData = validLogs.map(log => ({
        x: log.timestamp.toDate().getTime(),
        y: log.movement
    }));

    createOrUpdateChart({
        canvasId: "tremorChart",
        label: "Tremor",
        data: tremorData,
        medicationTimes,
        min: 0,
        max: 3,
        step: 1
    });

    createOrUpdateChart({
        canvasId: "stiffnessChart",
        label: "Stiffness",
        data: stiffnessData,
        medicationTimes,
        min: 0,
        max: 3,
        step: 1
    });

    createOrUpdateChart({
        canvasId: "movementChart",
        label: "Movement",
        data: movementData,
        medicationTimes,
        min: -1,
        max: 1,
        step: 1,
        tickFormatter: value => {
            if (value === -1) return "Slow";
            if (value === 0) return "Normal";
            if (value === 1) return "Fast";
            return value;
        }
    });
}

function createOrUpdateChart({
    canvasId,
    label,
    data,
    medicationTimes,
    min,
    max,
    step,
    tickFormatter
}) {

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const existingChart = chartInstances[canvasId];
    
    if (existingChart) {
        // Update existing chart
        existingChart.data.datasets[0].data = data;
        existingChart.medicationTimes = medicationTimes;
        existingChart.update();
    } else {
        // Create new chart
        const newChart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [{
                    label,
                    data,
                    borderWidth: 2,
                    tension: 0.3,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.1)"
                }]
            },
            options: {
                parsing: false,
                responsive: true,
                scales: {
                    x: {
                        type: "linear",
                        ticks: {
                            callback: function(value) {
                                return new Date(value).toLocaleTimeString();
                            }
                        }
                    },
                    y: {
                        min,
                        max,
                        ticks: {
                            stepSize: step,
                            callback: tickFormatter
                        }
                    }
                }
            }
        });
        
        newChart.medicationTimes = medicationTimes;
        chartInstances[canvasId] = newChart;
    }
}
