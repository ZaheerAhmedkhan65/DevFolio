const Project = require('../models/Project');
const User = require('../models/User'); 

class ProjectController {

    static async getProjects(req, res) {
        try {
            const user = await User.findByUsernameSlug(req.params.username_slug);
            const projects = await Project.findByUserId(user.id);
            res.render('public/projects/index', { title: "Projects", projects });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async newProject(req, res) {
        try {
            res.render('public/projects/new', { title: "New Project" });
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
            const { title, description, project_url, source_code_url, featured, display_order} = req.body;
            const user_id = req.user.userId;
            let  image_url = null;
             if (req.cloudinaryResult) {
                image_url = req.cloudinaryResult.secure_url;
            }
            const project = await Project.create({ user_id, title, description, image_url, project_url, source_code_url, featured: featured==='on' ? 1:0, display_order });
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
