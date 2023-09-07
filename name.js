import { elementArray, lineArray, elementDictionary, lineDictionary } from "./main.js";

import prefixes from './carbon_prefix.json' assert {type: 'json'}

export let Name = {
    alkane() {
        let carbons = elementArray.filter(e => {return e.name == 'C'})
        let carbonChains = []
        let length = 0
        let prefix

        for (const carbon of carbons) {
            let neighbourCarbons = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name == 'C'})
            if (neighbourCarbons.length !== 1) continue

            let branch = carbon.carbonTrace(carbon)
            if (branch.length > 1) {
                for (const b of branch) {
                    carbonChains.push([carbon].concat(b))
                }
            } else carbonChains.push([carbon].concat(...branch))
        }

        for (const chain of carbonChains) {
            if (chain.length > length) length = chain.length
        }
        
        for (const p of prefixes) {
            if (p.length == length) {
                prefix = p.name
                break
            }
        }
        
        let longestChains = carbonChains.filter(c => {return c.length == length})

        if (length !== carbons.length) {
            let lowestNumberChain
            let LowestIndex = length
            for (const chain of longestChains) {
                for (const carbon of chain) {
                    let branches = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !chain.includes(c)})
                    if (branches.length == 0) continue
                    
                    if (branches.indexOf(carbon) < LowestIndex)  {
                        lowestNumberChain = chain
                        LowestIndex = branches.indexOf(carbon)
                    }
                    break
                }
            }

            for (const carbon of lowestNumberChain) {
                let branchStems = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !chain.includes(c)})
                if (branchStems.length == 0) continue

                let branches = []

                for (const branchStem of branchStems) {
                    let branch = branchStem.trace(carbon)
                    let nameArray = Name.alkyl(branch)
                }
            }
        }
    },

    alkene() {

    },

    alkyne() {

    },

    enyne() {

    },

    alkyl(branch) {
        
    }
}