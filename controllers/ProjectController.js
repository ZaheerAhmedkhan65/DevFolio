const Project = require('../models/Project');

class ProjectController {

    static async getProjects(req, res) {
        try {
            const projects = await Project.findByUserId(req.params.userId);
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getProject(req, res) {
        try {
            const project = await Project.findById(req.params.id);
            if (!project) return res.status(404).json({ message: "Project not found" });
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createProject(req, res) {
        try {
            const project = await Project.create(req.body);
            res.status(201).json(project);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateProject(req, res) {
        try {
            const project = await Project.update(req.params.id, req.body);
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteProject(req, res) {
        try {
            await Project.delete(req.params.id);
            res.json({ message: "Project deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = ProjectController;
