import { elementArray, lineArray, elementDictionary, lineDictionary } from "./main.js";

import carbonPrefixes from './carbon_prefix.json' assert {type: 'json'}
import branchPrefixes from './carbon_prefix.json' assert {type: 'json'}

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
        
        let longestChains = carbonChains.filter(c => {return c.length == length})
        let lowestNumberChain

        if (length !== carbons.length) {
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
        } else lowestNumberChain = longestChains[0]

        let branches = this.branch(lowestNumberChain)
        
        
        prefix = carbonPrefixes[length - 1].name
        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b), () => {return a - b})

            numberBranchNames.push(numArray.join(', ')+ ' - ' + branchPrefixes[numArray.length - 1] + name)
        }

        return numberBranchNames.join(' ') + prefix + 'ane'
    },

    alkene() {

    },

    alkyne() {

    },

    enyne() {

    },

    alkyl(branch, startingElement, mainElement) {
        let branchDictionary = {}
        let carbonChains = []
        let carbonChain

        for (const element of branch) {
            branchDictionary[element.name] = (branchDictionary.hasOwnProperty(element.name))? branchDictionary[element.name] + 1: 1;
        }

        let tracedElement = selectedElement.carbonTrace(mainElement)
        if (tracedElement.length > 1) {
            for (const b of tracedElement) {
                carbonChains.push([carbon].concat(b))
            }
        } else carbonChains.push([carbon].concat(...tracedElement))

        carbonChains.sort((a, b), () => {return b.length - a.length})
        carbonChain = carbonChains[0]

        let number = 1
        let branches = Name.branch()
        let prefix
        
        prefix = carbonPrefixes[number - 1].name

        let branchNames = [...new Set(branches.map(b => {return b[0]}))]
        let numberBranchNames = []

        branchNames.sort()
        for (const name of branchNames) {
            let numArray = []
            for (const branch of branches) {
                if (branch[0] == name) numArray.push(branch[1]) 
            }
            numArray.sort((a, b), () => {return a - b})

            numberBranchNames.push(numArray.join(', ')+ ' - ' + branchPrefixes[numArray.length - 1] + name)
        }

        return numberBranchNames.join(' ') + prefix + 'yl'
    },

    branch(carbonChain) {
        let branches = []

        for (const carbon of carbonChain) {
            let branchStems = [carbon.left, carbon.right, carbon.up, carbon.down].filter(c => {return c !== undefined && c.name !== 'H' && !carbonChain.includes(c)})
            if (branchStems.length == 0) continue
            for (const branchStem of branchStems) {
                switch (branchStem.name) {
                    case 'C':
                        let branch = branchStem.trace(carbon)
                        let name = Name.alkyl(branch, branchStem, carbon)
                        branches.push([name, number])
                        break;
                    case 'Cl':
                        branches.push(['chloro', number])
                        break;
                    case 'Br':
                        branches.push(['bromo', number])
                        break;
                    case 'I':
                        branches.push(['iodo', number])
                        break;
                }
            }
            number++
        }

        return branches
    }


}