import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/AuthGuards/user.auth.guard';

@Controller('project')
export class ProjectController {
    constructor(
        private readonly projectService: ProjectService
    ) { }


    @Post('create')
    @UseGuards(JwtAuthGuard)
    createProject(
        @Body() body: { name: string, description: string },
        @Req() req: any
    ) {
        console.log(req.user.id, 'ppp');

        const id = req.user.id
        return this.projectService.createProject(body.name, body.description, id);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put('update/:id')
    updateProject(
        @Param('id') id: string,
        @Body() body: { name: string, description: string },
        @Req() req: any
    ) {
        console.log("CONTROLLER HIT");
        const userId = req.user.id
        return this.projectService.updateProject(id, body.name, body.description, userId);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Delete('delete/:id')
    deleteProject(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const userId = req.user.id
        return this.projectService.deleteProject(id, userId);
    }

    // @UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.OK)
    // @Get(':id')
    // getProject(
    //     @Param('id') id: string,
    //     @Req() req: any
    // ) {
    //     const userId = req.user.id
    //     return this.projectService.getProject(id, userId);
    // }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('fetch-all')
    getAllProjects(
        @Req() req: any,
        @Query() query: any
    ) {
        console.log(req.user);

        const userId = req.user.id
        return this.projectService.getAllProjects(userId, query);
    }
}
