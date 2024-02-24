import { Element } from "./element.js"
import { Line } from "./line.js"
import { gridSize, locateGrid, gridArray, rowArray, newLine, elementArray, cycloElementArray, cycloArray} from "./main.js"

export class Cyclo {
    constructor(x, y, orientation, parent, sides = 6, radius = 3) {
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
            newLine("left", Math.abs(this.x - this.r + 3))
            this.x = this.r + 3
        }
        if (this.y - this.r - 2 < 1) {
            newLine("up", Math.abs(this.y - this.r + 3))
            this.y = this.r + 3
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
        debugger
        for (let i = 0; i < this.sides; i++) {
            let x = Math.round(this.r * Math.cos(theta * PI))
            let y = Math.round(this.r * Math.sin(theta * PI))
            let grid = locateGrid(this.x + x, this.y + y)
            let element = new CycloElement("C", grid, 4)
            element.display()
            this.elementArray.push(element)
            theta += angle
            if ((parent.x == element.x && Math.abs(parent.y - returnedElem.y) > Math.abs(parent.y - element.y)) || (parent.y == element.y && Math.abs(parent.x - returnedElem.x) > Math.abs(parent.x - element.x))) returnedElem = element
        }
        return returnedElem
    }
};

export class CycloElement extends Element {
    constructor(name, location, bonds) {
        super(name, location, bonds)
        this.clockwise = undefined
        this.antiClockwise = undefined
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

    displayElement() {
        return
    }
}
