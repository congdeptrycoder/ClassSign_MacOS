export enum RegistrationPeriodType {
    REGISTER_PROGRAM = 'register_program',
    REGISTER_CLASS = 'register_class',
    NONE = 'none',
}

export enum StudentStatus {
    STUDY = 'study',
    STUDY_CC1 = 'study_cc1',
    STUDY_CC2 = 'study_cc2',
    STUDY_CC3 = 'study_cc3',
    GRADUATE = 'graduate',
    LEAVE = 'leave',
    DROP = 'drop',
}

export enum CourseRegistrationStatus {
    AVAILABLE = 'available',
    BLOCKED = 'blocked',
    COMPLETED = 'completed',
    REGISTERED = 'registered',
    RE_REGISTERED = 're_registered',
    CANCELLED = 'cancelled',
}
