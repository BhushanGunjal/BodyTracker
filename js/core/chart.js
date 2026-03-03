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

let isRendering = false;
let selectedDate = new Date().toISOString().split('T')[0]; // Default to today

export function initChartDateFilter() {
    const dateFilter = document.getElementById("chart-date-filter");
    if (!dateFilter) {
        console.log("Date filter element not found!");
        return;
    }

    console.log("Setting up date filter");

    // Set default date to today in YYYY-MM-DD format (local timezone)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    selectedDate = `${year}-${month}-${day}`;
    
    dateFilter.value = selectedDate;
    console.log("Date filter initialized, selectedDate:", selectedDate);

    dateFilter.addEventListener("change", async (e) => {
        console.log("Change event fired, new value:", e.target.value);
        selectedDate = e.target.value;
        console.log("Date changed to:", selectedDate);
        console.log("isRendering before call:", isRendering);
        await renderDashboard();
    });
}

export async function renderDashboard() {
    // Prevent race conditions from overlapping renders
    if (isRendering) return;
    
    isRendering = true;
    
    try {
        const medicationLogs = await fetchMedicationLogs();
        const logs = await fetchSymptomLogs();

        // Filter logs that have resolved timestamps
        const validLogs = logs.filter(log => log.timestamp);
        const validMedicationLogs = medicationLogs.filter(log => log.timestamp);

        console.log("Total valid logs:", validLogs.length, "Selected date:", selectedDate);

        // Filter by selected date using local timezone
        const filteredLogs = validLogs.filter(log => {
            const logDate = log.timestamp.toDate();
            const year = logDate.getFullYear();
            const month = String(logDate.getMonth() + 1).padStart(2, '0');
            const day = String(logDate.getDate()).padStart(2, '0');
            const logDateString = `${year}-${month}-${day}`;
            return logDateString === selectedDate;
        });

        const filteredMedicationLogs = validMedicationLogs.filter(log => {
            const logDate = log.timestamp.toDate();
            const year = logDate.getFullYear();
            const month = String(logDate.getMonth() + 1).padStart(2, '0');
            const day = String(logDate.getDate()).padStart(2, '0');
            const logDateString = `${year}-${month}-${day}`;
            return logDateString === selectedDate;
        });

        console.log("Filtered logs after date filter:", filteredLogs.length);

        const medicationTimes = filteredMedicationLogs.map(log =>
            log.timestamp.toDate().getHours()
        );

        const tremorData = filteredLogs.map(log => ({
            x: log.timestamp.toDate().getHours(),
            y: log.tremor
        }));

        const stiffnessData = filteredLogs.map(log => ({
            x: log.timestamp.toDate().getHours(),
            y: log.stiffness
        }));

        const movementData = filteredLogs.map(log => ({
            x: log.timestamp.toDate().getHours(),
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
        console.log("Dashboard render completed");
    } finally {
        isRendering = false;
        console.log("isRendering set to false");
    }
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
        // Update existing chart - replace dataset data
        existingChart.data.datasets[0].data = [...data];
        existingChart.medicationTimes = medicationTimes;
        existingChart.update('none');
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
                        min: 7,
                        max: 24,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const hour = parseInt(value);
                                if (hour === 0) return "12AM";
                                if (hour < 12) return hour + "AM";
                                if (hour === 12) return "12PM";
                                if (hour === 24) return "12AM";
                                return (hour - 12) + "PM";
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
