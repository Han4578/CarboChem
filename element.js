import { Line } from "./line.js"
import { lineArray, locateGrid, refreshClickableLines, newLine, elementArray, move, refreshAllLines, ElementObjectMatch } from "./main.js"

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
        this.extendedLeft = false
        this.extendedRight = false
        this.extendedUp = false
        this.extendedDown = false
    }

    refreshLines() {
        let grids = this.scan()
        let emptyGrids = grids.filter(g => {return g.children.length == 0})

        if (4 - emptyGrids.length !== this.bonds) {
            for (const grid of emptyGrids) {
                let lineObj

                if (parseInt(grid.dataset.x) !== this.x) {
                    lineObj = new Line('h', grid)
                } else lineObj = new Line('v', grid)


                lineObj.displayLine()
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
            newLine('left', 2)
        }
        if (this.y == 1) {
            newLine('up', 2)   
        }


        let upperGrid = locateGrid(this.x, this.y - 1)
        let lowerGrid = locateGrid(this.x, this.y + 1)
        let leftGrid = locateGrid(this.x - 1, this.y)
        let rightGrid = locateGrid(this.x + 1, this.y)

        if (rightGrid == undefined) {
            newLine('right', 2)
            rightGrid = locateGrid(this.x + 1, this.y)
        }
        if (lowerGrid == undefined) {
            newLine('down', 2)
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
    
    checkForExpansion(direction) {
        if (direction.name !== 'C') return

        let refreshNeeded = false
        
        if (direction == this.up || direction == this.down) {
            if (this.right !== undefined && this.right.name == 'C' && !this.extendedRight) {

                let ElementsToMove = [this.right, ...this.right.trace(this)]
                
                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedRight = true
            }

            if (this.left !== undefined && this.left.name == 'C' && !this.extendedLeft) {

                let ElementsToMove = [this, ...this.trace(this.left)]

                move('right', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedLeft = true
            }
            
        } else {
            if (this.down !== undefined && this.down.name == 'C' && !this.extendedDown) {

                let ElementsToMove = [this.down, ...this.down.trace(this)]
                
                move('down', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedDown = true
            }

            if (this.up !== undefined && this.up.name == 'C' && !this.extendedUp) {

                let ElementsToMove = [this, ...this.trace(this.up)]

                move('down', ElementsToMove, 2)
                refreshNeeded = true
                this.extendedUp = true
            }

        }

        if (refreshNeeded) {
            refreshAllLines();
            return true
        }
        return false
    }

    trace(exception) {
        let elementsToTrace = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined && e !== exception})
        let finalTraced = elementsToTrace

        for (const element of elementsToTrace) {
            let tracedElements = element.trace(this)
            finalTraced = finalTraced.concat(tracedElements)
        }

        return finalTraced
    }

    backTrace(direction, exception) {
        let neighbourElements = [this.left, this.right, this.up, this.down].filter(e => {return e !== undefined})

        for (const element of neighbourElements) {
            if (element == exception) continue
            if ((element.x == this.x && element.y == this.y) || (element.x !== this.x && element.y !== this.y)) {
                move(direction, [element], 2)
                element.backTrace(direction, this)
            }
        }
    }
}