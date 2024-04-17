import { Router } from "express";
import { addCourse, deleteCourse, getACourse, getCourseUploadedByUser, getCourses, getOwner, getSingleCourse, getTotalEnrolledUser } from "../controllers/course.controller.js";
import { verifyToken } from "../utils/tokenManager.js";
import { upload } from "../middlewares/multer.middleware.js";
import { EnrollInCourse } from "../controllers/user.controller.js";
const courseRouter=Router();
courseRouter.use(verifyToken)
courseRouter.get('/',getCourses)
courseRouter.get('/yourcourses',getCourseUploadedByUser)
courseRouter.get('/:name',getACourse)
courseRouter.get('/:name/:id',getSingleCourse)
courseRouter.post('/:name/:id',EnrollInCourse)
courseRouter.get('/enrolleduser/count/:id',getTotalEnrolledUser)
courseRouter.get('/course/owner/:id',getOwner)
courseRouter.delete('/course/delete/:id',deleteCourse)
courseRouter.post('/addCourse',upload.fields([
    {
        name:"thumbnail",
        maxCount:1
    },
    {
        name:"video",
        maxCount:1,
    }
]),
addCourse
)
export default courseRouter