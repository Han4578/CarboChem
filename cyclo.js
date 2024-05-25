import { Element } from "./element.js"
import { Line } from "./line.js"
import { gridSize, locateGrid, gridArray, rowArray, newLine, cycloElementArray, cycloArray} from "./main.js"

export class Cyclo {
    constructor(x, y, orientation, parent, radius = 4, sides = 6) {
        this.x = x
        this.y = y
        this.orientation = orientation
        this.sides = sides
        this.r = radius
        this.elementArray = []
        cycloArray.push(this)
        return this.displayElement(parent)
    }

    displayElement(parent) {
        if (this.x - this.r - 2 < 1) {
            newLine("left", Math.abs(this.x - this.r - 2))
            this.x = this.r + 2
        }
        if (this.y - this.r - 2 < 1) {
            newLine("up", Math.abs(this.y - this.r - 2))
            this.y = this.r + 2
        }
        if (this.x + this.r + 2 > gridArray.length / rowArray.length) {
            newLine("right", Math.abs(this.x + this.r + 2 - (gridArray.length / rowArray.length)))
        }
        if (this.y + this.r + 2 > rowArray.length) {
            newLine("down", Math.abs(this.y + this.r + 2 - rowArray.length))
        }
        const PI = Math.PI
        let theta = (this.orientation == "v")? 1 / 2 : 0
        let angle = 2  / this.sides
        let returnedElem = {x : Infinity, y: Infinity}
        let previousElem = {} 
        
        for (let i = 0; i < this.sides; i++) {
            let x = Math.round(Math.round(this.r * Math.cos(theta * PI) * 100) / 100)
            let y = Math.round(Math.round(this.r * Math.sin(theta * PI) * 100) / 100)
            let grid = locateGrid(this.x + x, this.y + y)
            let element = new CycloElement("C", grid, 4, this)
            element.display()
            previousElem.clockwise = element
            element.antiClockwise = previousElem
            this.elementArray.push(element)
            theta += angle
            if ((parent.x == element.x && Math.abs(parent.y - returnedElem.y) > Math.abs(parent.y - element.y)) || (parent.y == element.y && Math.abs(parent.x - returnedElem.x) > Math.abs(parent.x - element.x))) returnedElem = element
            previousElem = element
        }
        this.elementArray[0].antiClockwise = previousElem

        for (const iterator of this.elementArray) {
            
        }
        return returnedElem
    }

    checkWithin(x, y) {
        return ((this.x - this.r <= x || this.x + this.r >= x) && (this.y - this.r <= y || this.y + this.r >= y))
    }
};

export class CycloElement extends Element {
    constructor(name, location, bonds, cyclo) {
        super(name, location, bonds)
        this.clockwise = undefined
        this.antiClockwise = undefined
        this.isCyclo = true
        this.cyclo = cyclo
    }

    display() {
        const elementElem = document.createElement('div');
        let grid = locateGrid(this.x, this.y)
        
        elementElem.classList.add('element')
        elementElem.innerText = this.name
        this.element = elementElem

        grid.appendChild(elementElem)
        cycloElementArray.push(this)
    }

    displayElement() {return}

    trace() {
        return this.cyclo.elementArray
    }
}
