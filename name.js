import { elementArray, lineArray, elementDictionary, lineDictionary } from "./main.js";

export let Name = {
    alkane() {
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let carbonBranches = []

        for (const carbon of carbons) {
            let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
            if (neighbourCarbons.length !== 1) continue

            let branch = carbon.carbonTrace(carbon)
            if (branch.length > 1) {
                for (const b of branch) {
                    carbonBranches.push([carbon].concat(b))
                }
            } else carbonBranches.push([carbon].concat(...branch))
        }
    },

    alkene() {

    },

    alkyne() {

    },

    enyne() {

    }
}