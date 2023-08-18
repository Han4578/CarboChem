import { Line } from "./line.js"
import { lineArray, locateGrid, refreshClickableLines, newLine, elementArray } from "./main.js"

export class Element {
    constructor(name, location, bonds) {
        this.name = name
        this.x = parseInt(location.dataset.x)
        this.y = parseInt(location.dataset.y)
        this.bonds = bonds
        this.element = undefined
        this.left = undefined
        this.right = undefined
        this.up = undefined
        this.down = undefined
    }

    refreshLines() {
        this.updatePosition()
        let grids = this.scan()
        let emptyGrids = grids.filter(g => {return g.children.length == 0})

        if (4 - emptyGrids.length !== this.bonds) {
            for (const grid of emptyGrids) {
                let lineObj

                if (parseInt(grid.dataset.x) !== this.x) {
                    lineObj = new Line('h', grid)
                } else lineObj = new Line('v', grid)


                lineObj.addLine()
                lineArray.push(lineObj)
            }
        }

        refreshClickableLines()
    }

    updatePosition() {
        this.x = parseInt(this.element.parentElement.dataset.x)
        this.y = parseInt(this.element.parentElement.dataset.y)
    }

    scan() {
        if (this.x == 1) {
            newLine('left')
            newLine('left')
        }
        if (this.y == 1) {
            newLine('up')
            newLine('up')   
        }


        let upperGrid = locateGrid(this.x, this.y - 1)
        let lowerGrid = locateGrid(this.x, this.y + 1)
        let leftGrid = locateGrid(this.x - 1, this.y)
        let rightGrid = locateGrid(this.x + 1, this.y)

        if (rightGrid == undefined) {
            newLine('right')
            newLine('right')
            rightGrid = locateGrid(this.x + 1, this.y)
        }
        if (lowerGrid == undefined) {
            newLine('down')
            newLine('down')
            lowerGrid = locateGrid(this.x, this.y + 1)
        }

        return [upperGrid, lowerGrid, leftGrid, rightGrid]
    }

    displayElement() {
        const elementElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        elementElem.classList.add('element')
        elementElem.innerText = this.name
        this.element = elementElem

        grid.appendChild(elementElem)
        elementArray.push(this)

        this.refreshLines()
    }
    
    checkForExpansion(exception) {
        let grids = this.scan()

        for (const grid of grids) {
            if (grid == exception.element) return


        }
    }
}