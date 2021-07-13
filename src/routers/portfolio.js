const express = require('express')
const Portfolio = require('../models/portfolio')
const auth = require('../middleware/auth')
const router = new express.Router()




router.get('/portfolio', auth, async (req, res) => {

    try {

        const portfolio = await Portfolio.findOne({owner:req.user._id})
        await portfolio.populate('owner').execPopulate()

        res.send(portfolio)

    } catch (e) {
        res.status(500).send(e)
    }
})


router.post('/portfolio/update', auth, async (req, res) => {
    const updates = Object.keys(req.body)
   
    try {
        const portfolio = await Portfolio.findOne({ owner: req.user._id })
        if (!portfolio) {
            return res.status(404).send()
        }

        updates.forEach((update) => portfolio[update] = req.body[update])
        await portfolio.save()
        res.send(portfolio)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/portfolio/:id', auth, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!portfolio) {
            res.status(404).send()
        }

        res.send(portfolio)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router