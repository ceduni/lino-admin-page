import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { transactionsAPI } from '../services/api'
import './TransactionGraphs.css'

function TransactionGraphs({ bookBoxId, bookBoxName }) {
  const [timePeriod, setTimePeriod] = useState('1week')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Cache all transactions once
  const [allTransactions, setAllTransactions] = useState([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  
  // Processed data for charts
  const [transactionData, setTransactionData] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  
  const dailyChartRef = useRef(null)
  const hourlyChartRef = useRef(null)

  // Load all transactions once when component mounts or bookBoxId changes
  useEffect(() => {
    if (bookBoxId && !isDataLoaded) {
      loadAllTransactions()
    }
  }, [bookBoxId])

  // Process daily data when time period changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      processDataForTimePeriod()
    }
  }, [allTransactions, timePeriod])

  // Process hourly data when selected date changes
  useEffect(() => {
    if (allTransactions.length > 0) {
      processHourlyDataForDate()
    }
  }, [allTransactions, selectedDate])

  const loadAllTransactions = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Fetch ALL transactions for the book box (no limit)
      const response = await transactionsAPI.searchTransactions({
        bookboxId: bookBoxId,
        limit: 10000 // Large limit to get all data
      })

      const transactions = response.transactions
      setAllTransactions(transactions)
      setIsDataLoaded(true)

    } catch (err) {
      setError(err.message || 'Failed to load transaction data')
    } finally {
      setIsLoading(false)
    }
  }

  const processDataForTimePeriod = () => {
    // Calculate date range based on time period
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timePeriod) {
      case '1week':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '1month':
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 7)
    }

    // Filter cached transactions by date range
    const filteredTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    // Use different aggregation strategies based on time period
    let processedData
    if (timePeriod === '1year' || timePeriod === '6months') {
      processedData = processTransactionsByMonth(filteredTransactions, startDate, endDate)
    } else if (timePeriod === '3months') {
      processedData = processTransactionsByWeek(filteredTransactions, startDate, endDate)
    } else {
      processedData = processTransactionsByDay(filteredTransactions, startDate, endDate)
    }
    
    setTransactionData(processedData)
  }

  const processHourlyDataForDate = () => {
    // Filter transactions for the selected date
    const selectedDateObj = new Date(selectedDate)
    const nextDay = new Date(selectedDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayTransactions = allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp)
      return transactionDate >= selectedDateObj && transactionDate < nextDay
    })

    const processedHourlyData = processTransactionsByHour(dayTransactions)
    setHourlyData(processedHourlyData)
  }

  const processTransactionsByDay = (transactions, startDate, endDate) => {
    const dayMap = new Map()
    
    // Initialize all days in range with zero values
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      dayMap.set(dateKey, { date: dateKey, takenBooks: 0, givenBooks: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.date)
      const dateKey = transactionDate.toISOString().split('T')[0]
      
      if (dayMap.has(dateKey)) {
        const dayData = dayMap.get(dateKey)
        if (transaction.action === 'took') {
          dayData.takenBooks += 1
        } else if (transaction.action === 'added') {
          dayData.givenBooks += 1
        }
      }
    })

    return Array.from(dayMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processTransactionsByMonth = (transactions, startDate, endDate) => {
    const monthMap = new Map()
    
    // Initialize all months in range with zero values
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    
    while (currentDate <= endMonth) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
      const displayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15) // Mid-month for display
      monthMap.set(monthKey, { 
        date: displayDate.toISOString().split('T')[0], 
        monthKey,
        takenBooks: 0, 
        givenBooks: 0 
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.date)
      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`
      
      if (monthMap.has(monthKey)) {
        const monthData = monthMap.get(monthKey)
        if (transaction.action === 'took') {
          monthData.takenBooks += 1
        } else if (transaction.action === 'added') {
          monthData.givenBooks += 1
        }
      }
    })

    return Array.from(monthMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processTransactionsByWeek = (transactions, startDate, endDate) => {
    const weekMap = new Map()
    
    // Find the start of the first week (Monday)
    const firstWeekStart = new Date(startDate)
    const dayOfWeek = firstWeekStart.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    firstWeekStart.setDate(firstWeekStart.getDate() - daysToMonday)
    
    // Initialize all weeks in range
    const currentWeekStart = new Date(firstWeekStart)
    while (currentWeekStart <= endDate) {
      const weekKey = currentWeekStart.toISOString().split('T')[0]
      const weekMidpoint = new Date(currentWeekStart)
      weekMidpoint.setDate(weekMidpoint.getDate() + 3) // Wednesday of the week
      
      weekMap.set(weekKey, { 
        date: weekMidpoint.toISOString().split('T')[0], 
        weekStart: weekKey,
        takenBooks: 0, 
        givenBooks: 0 
      })
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp || transaction.date)
      
      // Find which week this transaction belongs to
      const transactionDay = transactionDate.getDay()
      const daysToMonday = transactionDay === 0 ? 6 : transactionDay - 1
      const weekStart = new Date(transactionDate)
      weekStart.setDate(weekStart.getDate() - daysToMonday)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (weekMap.has(weekKey)) {
        const weekData = weekMap.get(weekKey)
        if (transaction.action === 'took') {
          weekData.takenBooks += 1
        } else if (transaction.action === 'added') {
          weekData.givenBooks += 1
        }
      }
    })

    return Array.from(weekMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const processTransactionsByHour = (transactions) => {
    const hourMap = new Map()
    
    // Initialize all hours (0-23) with zero values
    for (let hour = 0; hour < 24; hour++) {
      hourMap.set(hour, { hour, takenBooks: 0, givenBooks: 0 })
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.timestamp)
      const hour = transactionDate.getHours()
      
      const hourData = hourMap.get(hour)
      if (transaction.action === 'took') {
        hourData.takenBooks += 1
      } else if (transaction.action === 'added') {
        hourData.givenBooks += 1
      }
    }) 

    return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour)
  }

  useEffect(() => {
    if (transactionData.length > 0) {
      drawDailyChart()
    }
  }, [transactionData])

  useEffect(() => {
    if (hourlyData.length > 0) {
      drawHourlyChart()
    }
  }, [hourlyData])

  const drawDailyChart = () => {
    const container = dailyChartRef.current
    if (!container) return

    // Clear previous chart
    d3.select(container).selectAll('*').remove()

    const margin = { top: 20, right: 80, bottom: 60, left: 60 }
    const width = container.offsetWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const maxValue = d3.max(transactionData, d => Math.max(d.takenBooks, d.givenBooks)) || 1
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0])

    // Always use bar chart - calculate bar width with no padding
    const barWidth = Math.max(width / transactionData.length / 3, 8) // Adaptive bar width, minimum 8px

    // Create x-scale with padding to prevent overflow on the left
    const dateExtent = d3.extent(transactionData, d => new Date(d.date))
    const timePadding = (dateExtent[1] - dateExtent[0]) * 0.05 // 5% padding on each side
    
    const xScale = d3.scaleTime()
      .domain([new Date(dateExtent[0].getTime() - timePadding), new Date(dateExtent[1].getTime() + timePadding)])
      .range([0, width])

    // Determine axis format based on time period
    let xAxisFormat
    if (timePeriod === '1year' || timePeriod === '6months') {
      xAxisFormat = d3.timeFormat('%b %Y')
    } else if (timePeriod === '3months') {
      xAxisFormat = d3.timeFormat('%m/%d')
    } else {
      xAxisFormat = d3.timeFormat('%m/%d')
    }

    // Add axes with explicit tick values to align with data points
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(transactionData.map(d => new Date(d.date)))
        .tickFormat(xAxisFormat))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.min(maxValue, 10)).tickFormat(d3.format('d')))

    // Add bars for given books - positioned on the LEFT side of the date
    g.selectAll('.given-bar')
      .data(transactionData)
      .enter().append('rect')
      .attr('class', 'given-bar')
      .attr('x', d => xScale(new Date(d.date)) - barWidth)
      .attr('y', d => yScale(d.givenBooks))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.givenBooks))
      .attr('fill', '#27ae60')
      .attr('opacity', 0.8)

    // Add bars for taken books - positioned on the RIGHT side of the date
    g.selectAll('.taken-bar')
      .data(transactionData)
      .enter().append('rect')
      .attr('class', 'taken-bar')
      .attr('x', d => xScale(new Date(d.date)))
      .attr('y', d => yScale(d.takenBooks))
      .attr('width', barWidth)
      .attr('height', d => height - yScale(d.takenBooks))
      .attr('fill', '#339cff')
      .attr('opacity', 0.8)

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Number of Books')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Date')

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 70}, 20)`)

    // Rectangle legend for bar chart
    legend.append('rect')
      .attr('x', 0)
      .attr('y', -5)
      .attr('width', 15)
      .attr('height', 10)
      .attr('fill', '#339cff')
      .attr('opacity', 0.8)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Taken')

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 15)
      .attr('width', 15)
      .attr('height', 10)
      .attr('fill', '#27ae60')
      .attr('opacity', 0.8)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Given')
  }

  const drawHourlyChart = () => {
    const container = hourlyChartRef.current
    if (!container) return

    // Clear previous chart
    d3.select(container).selectAll('*').remove()

    const margin = { top: 20, right: 80, bottom: 60, left: 60 }
    const width = container.offsetWidth - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, width])

    const maxValue = d3.max(hourlyData, d => Math.max(d.takenBooks, d.givenBooks)) || 1
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0])

    // Add axes with integer ticks
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}:00`))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(Math.min(maxValue, 10)).tickFormat(d3.format('d')))

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Number of Books')

    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Hour of Day')

    // Create line generators
    const takenLine = d3.line()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.takenBooks))
      .curve(d3.curveLinear)

    const givenLine = d3.line()
      .x(d => xScale(d.hour))
      .y(d => yScale(d.givenBooks))
      .curve(d3.curveLinear)

    // Add lines
    g.append('path')
      .datum(hourlyData)
      .attr('fill', 'none')
      .attr('stroke', '#339cff')
      .attr('stroke-width', 2)
      .attr('d', takenLine)

    g.append('path')
      .datum(hourlyData)
      .attr('fill', 'none')
      .attr('stroke', '#27ae60')
      .attr('stroke-width', 2)
      .attr('d', givenLine)

    // Add dots for taken books
    g.selectAll('.taken-dot')
      .data(hourlyData)
      .enter().append('circle')
      .attr('class', 'taken-dot')
      .attr('cx', d => xScale(d.hour))
      .attr('cy', d => yScale(d.takenBooks))
      .attr('r', 3)
      .attr('fill', '#339cff')

    // Add dots for given books
    g.selectAll('.given-dot')
      .data(hourlyData)
      .enter().append('circle')
      .attr('class', 'given-dot')
      .attr('cx', d => xScale(d.hour))
      .attr('cy', d => yScale(d.givenBooks))
      .attr('r', 3)
      .attr('fill', '#27ae60')

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 70}, 20)`)

    // Line legend for line chart
    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#339cff')
      .attr('stroke-width', 2)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Taken')

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', '#27ae60')
      .attr('stroke-width', 2)

    legend.append('text')
      .attr('x', 20)
      .attr('y', 20)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text('Given')
  }

  return (
    <div className="transaction-graphs">
      {error && <div className="error-message">{error}</div>}
      
      {/* Daily Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h4>Transaction Frequency Over Time</h4>
          <div className="time-period-selector">
            <label htmlFor="timePeriod">Time Period:</label>
            <select
              id="timePeriod"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="1week">Last Week</option>
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="chart-loading">Loading chart data...</div>
        ) : (
          <div className="chart-container" ref={dailyChartRef}></div>
        )}
      </div>

      {/* Hourly Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h4>Hourly Transaction Pattern</h4>
          <div className="date-selector">
            <label htmlFor="selectedDate">Select Date:</label>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="chart-container" ref={hourlyChartRef}></div>
      </div>
    </div>
  )
}

export default TransactionGraphs
