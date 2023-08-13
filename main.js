let container = document.querySelector('.container')
let resetButton = document.querySelector('.reset')
let actions = document.querySelectorAll('.action')
let gridArray = []
let RowArray = []
let lineArray = []
let elementArray = []
let columnNum = 5
let rowNum = 5
let gridSize = 50
let selectedElement = 'C'

function reset() { 
    container.innerHTML = ''
    gridArray = []
    RowArray = []
    lineArray = []
    elementArray = []
    columnNum = 5
    rowNum = 5
    changeSelection('C')
    container.classList.remove('start-up')
    container.classList.remove('start-left')

    for (let i = 0; i < 5; i++) {
        const row = addRow(container)
        for (let j = 0; j < 5; j++) {
            addGrid(row)
        }
        container.appendChild(row)
    }

    addElement(gridArray[12])
    addLine(gridArray[7], 'vertical')
    addLine(gridArray[11], 'horizontal')
    addLine(gridArray[13], 'horizontal')
    addLine(gridArray[17], 'vertical')

    refreshClickableLines()
}

function addGrid(row) {
    let grid = document.createElement('div')

    grid.classList.add('grid')
    grid.dataset.x = row.children.length + 1
    grid.dataset.y = row.dataset.row

    row.appendChild(grid)
    gridArray.push(grid)
    return grid
}

function addRow(c) {
    const row = document.createElement('div');

    row.classList.add('row')
    row.dataset.row = RowArray.length + 1

    c.appendChild(row)
    RowArray.push(row)
    return row
}

function addElement(grid) {
    const element = document.createElement('div');

    element.classList.add('element')
    element.innerText = selectedElement

    grid.appendChild(element)
    elementArray.push(element)
    return element
}

function addLine(grid, direction) {
    const line = document.createElement('div');

    line.classList.add(direction)
    line.dataset.direction = direction
    
    grid.appendChild(line)
    lineArray.push(line)
    return line
}

function addBubble(e) {
    let line = e.target
    let grid = locateGrid(line.dataset.availableX, line.dataset.availableY)
    let direction = line.dataset.direction

    
    addElement(grid)
    refreshLines(grid)
    refreshClickableLines()
}

function locateGrid(x, y) {
    return gridArray.filter(g => {return g.dataset.x == x && g.dataset.y == y})[0]
}

function refreshClickableLines() {
    let clickableArray = []
    let grids = []
    
    for (const line of lineArray) {
        let grid = line.parentElement
        let x = parseInt(grid.dataset.x)
        let y = parseInt(grid.dataset.y)

        if (line.dataset.direction == 'vertical') {
            let upperGrid = locateGrid(x, y - 1)
            let lowerGrid = locateGrid(x, y + 1)
            grids = [upperGrid, lowerGrid]

        } else {
            let leftGrid = locateGrid(x - 1, y)
            let rightGrid = locateGrid(x + 1, y)
            grids = [leftGrid, rightGrid]

        }

        let emptyGrids = grids.filter(g => {return g.innerHTML == ''})

        if (emptyGrids.length > 0) {
            let emptyGrid = emptyGrids[0]
            line.dataset.availableX = emptyGrid.dataset.x
            line.dataset.availableY = emptyGrid.dataset.y
            clickableArray.push(line)
        }
        line.classList.remove('clickable')
        line.removeEventListener('click', addBubble)
    }

    for (const clickable of clickableArray) {
        clickable.classList.add('clickable')
        clickable.addEventListener('click', addBubble)
    }
}

function refreshLines(grid) {
    let x = parseInt(grid.dataset.x)
    let y = parseInt(grid.dataset.y)

    if (x == 1) {
        newLine('left')
        newLine('left')
        x += 2
    }
    if (y == 1) {
        newLine('up')
        newLine('up')   
        y += 2
    }

    let upperGrid = locateGrid(x, y - 1)
    let lowerGrid = locateGrid(x, y + 1)
    let leftGrid = locateGrid(x - 1, y)
    let rightGrid = locateGrid(x + 1, y)
    
    if (rightGrid == undefined) {
        newLine('right')
        newLine('right')
        rightGrid = locateGrid(x + 1, y)
    }
    if (lowerGrid == undefined) {
        newLine('down')
        newLine('down')
        lowerGrid = locateGrid(x, y + 1)
    }

    if (upperGrid.innerHTML == '') addLine(upperGrid, 'vertical')
    if (lowerGrid.innerHTML == '') addLine(lowerGrid, 'vertical')
    if (leftGrid.innerHTML == '') addLine(leftGrid, 'horizontal')
    if (rightGrid.innerHTML == '') addLine(rightGrid, 'horizontal')
}

function newLine(direction) {
    if (direction == 'left' || direction == 'right') {
        for (const row of RowArray) {
            addGrid(row)
        }
        columnNum++
        checkScreenSize()
    } else {
        let row = addRow(container)
        for (let i = 0; i < columnNum; i++) {
            addGrid(row)
        }
        rowNum++
        checkScreenSize()
    }

    if (direction == 'left' || direction == 'up') {
        move(direction)
    }
}

function move(direction) {
    let stuff = elementArray.concat(lineArray)

    for (const s of stuff) {
        let grid = s.parentElement
        let x = parseInt(grid.dataset.x)
        let y = parseInt(grid.dataset.y)
        
        switch (direction) { //away from direction
            case 'left':
                x +=1
                break;
            case 'right':
                x -=1
                break;
            case 'up':
                y +=1
                break;
            case 'down':
                y -=1
                break;
            default:
                alert('failed to move')
                break;
        }
        let newGrid = locateGrid(x, y)
        newGrid.appendChild(s)
    }

}

function checkScreenSize() {
    if (columnNum > window.innerWidth / gridSize) container.classList.add('start-left')
    else container.classList.remove('start-left')

    if (rowNum > window.innerHeight * 0.8 / gridSize) container.classList.add('start-up')
    else container.classList.remove('start-up')
}

function changeSelection(element) {
    for (const action of actions) {
        (action.innerText == element)? action.classList.add('selected'): action.classList.remove('selected');
    }
    selectedElement = element
}


resetButton.addEventListener('click', reset)
window.addEventListener('resize', checkScreenSize)

for (const action of actions) {
    action.addEventListener('click', () => {
        changeSelection(action.innerText)
    })
}

window.addEventListener('keydown', e => {
    let key = e.key

    switch (key) {
        case 'C':
        case 'c':
            changeSelection('C')
            break;
        case 'H':
        case 'h':
            changeSelection('H')
        break;
    
        default:
            break;
    }
})
reset()