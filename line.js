import { selectedElement, locateGrid, elementArray, lineArray } from "./main.js"
import { Element } from "./element.js"

export class Line {
    constructor(orientaion, location) {
        this.orientaion = orientaion
        this.x = parseInt(location.dataset.x)
        this.y = parseInt(location.dataset.y)
        this.element = undefined
    }

    addElement() {
        let lineObj = lineArray.filter(l => {return l.element == this})[0]
        let sideGrids = lineObj.scan()

        let oldElem = sideGrids.filter(g => {return g.children.length > 0})[0]
        let newGrid = sideGrids.filter(g => {return g.children.length == 0})[0]

        const element = new Element(selectedElement, newGrid);

        if (parseInt(newGrid.dataset.x) > this.x) element.left = oldElem
        if (parseInt(newGrid.dataset.x) < this.x) element.right = oldElem
        if (parseInt(newGrid.dataset.y) > this.y) element.down = oldElem
        if (parseInt(newGrid.dataset.y) < this.y)  element.up = oldElem

        element.displayElement()
    }

    updatePosition() {
        if (this.element == undefined) return
        this.x = parseInt(this.element.parentElement.dataset.x)
        this.y = parseInt(this.element.parentElement.dataset.y)
    }

    scan() {
        if (this.orientaion == 'v') {
            let upperGrid = locateGrid(this.x, this.y - 1)
            let lowerGrid = locateGrid(this.x, this.y + 1)
            return [upperGrid, lowerGrid]
        }
        if (this.orientaion == 'h') {
            let leftGrid = locateGrid(this.x - 1, this.y)
            let rightGrid = locateGrid(this.x + 1, this.y)
            return [leftGrid, rightGrid]
        }
    }

    addLine() {
        const lineElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        lineElem.classList.add(this.orientaion)
        this.element = lineElem
        grid.appendChild(lineElem)
    }

    checkClickability() {
        this.updatePosition()
        let sideGrids = this.scan()
        let emptyGrid = sideGrids.filter(g => {return g.children.length == 0})
        if (emptyGrid.length > 0) {
            this.element.addEventListener('click', this.addElement)
            this.element.classList.add('clickable')
        }
    }
}