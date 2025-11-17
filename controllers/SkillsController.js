const Skill = require('../models/Skill');

class SkillsController {

    static async getAllSkills(req, res) {
        try {
            const skills = await Skill.getAll();
            res.json(skills);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createSkill(req, res) {
        try {
            const skill = await Skill.create(req.body.name);
            res.status(201).json(skill);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteSkill(req, res) {
        try {
            await Skill.delete(req.params.id);
            res.json({ message: "Skill removed" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = SkillsController;
