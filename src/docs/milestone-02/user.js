export class user {
    id;
    course_ids_participant;
    course_ids_host;
    constructor(course_id, isHost) {
        if(isHost) {
            this.course_ids_host.push(course_id);
        } else {
            this.course_ids_participant.push(course_id);
        }
    }
}