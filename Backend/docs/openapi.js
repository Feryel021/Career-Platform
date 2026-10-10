// OpenAPI 3.0 description of the Career Guidance & Mentorship Portal API.
// Served as interactive documentation at /api-docs.

const bearer = [{ bearerAuth: [] }];

const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const idParam = (name) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Career Guidance & Mentorship Portal API',
    version: '1.0.0',
    description:
      'REST API for a web platform that connects students, mentors and professionals. ' +
      'Authentication uses JSON Web Tokens: log in, then click "Authorize" and paste the token.',
  },
  tags: [
    { name: 'Auth', description: 'Registration and login' },
    { name: 'Mentors', description: 'Mentor directory and mentorship requests' },
    { name: 'Jobs', description: 'Jobs and internships' },
    { name: 'Resources', description: 'Career resources' },
    { name: 'Messages', description: 'One-to-one messaging' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Something went wrong.' } },
      },
      Message: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Anna Kiss' },
          email: { type: 'string', format: 'email', example: 'anna@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 72, example: 'password123' },
          role: { type: 'string', enum: ['student', 'mentor', 'professional'] },
          field: { type: 'string', maxLength: 100, example: 'Software Engineering' },
          experience: { type: 'string', maxLength: 100, example: '5 years' },
          bio: { type: 'string', maxLength: 1000 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'anna@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['student', 'mentor', 'professional'] },
            },
          },
        },
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          type: { type: 'string', enum: ['full-time', 'part-time', 'internship'] },
          apply_link: { type: 'string', nullable: true },
          posted_by: { type: 'integer' },
          posted_by_name: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      JobRequest: {
        type: 'object',
        required: ['title', 'company', 'type'],
        properties: {
          title: { type: 'string', maxLength: 100 },
          company: { type: 'string', maxLength: 100 },
          location: { type: 'string', maxLength: 100 },
          description: { type: 'string', maxLength: 5000 },
          type: { type: 'string', enum: ['full-time', 'part-time', 'internship'], description: 'Students may only post internships.' },
          apply_link: { type: 'string', example: 'https://company.com/apply', description: 'Must start with http:// or https://' },
        },
      },
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          link: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          posted_by: { type: 'integer' },
          posted_by_name: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      ResourceRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', maxLength: 100 },
          description: { type: 'string', maxLength: 5000 },
          link: { type: 'string', example: 'https://example.com/guide' },
          category: { type: 'string', enum: ['CV Writing', 'Interview Tips', 'Career Advice', 'Technical Skills'] },
        },
      },
      MessageRequest: {
        type: 'object',
        required: ['receiverId', 'content'],
        properties: {
          receiverId: { type: 'integer', minimum: 1 },
          content: { type: 'string', minLength: 1, maxLength: 2000 },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        summary: 'Health check',
        responses: { 200: { description: 'Server is running', content: { 'application/json': { example: { status: 'ok' } } } } },
      },
    },

    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: {
          201: { description: 'User registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          400: errorResponse('Validation error or email already registered'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT (valid 24 hours)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          400: errorResponse('Invalid email or password'),
          429: errorResponse('Too many attempts (rate limit)'),
        },
      },
    },

    '/api/mentors': {
      get: {
        tags: ['Mentors'],
        summary: 'List all mentors (except yourself)',
        security: bearer,
        responses: { 200: { description: 'List of mentors' }, 401: errorResponse('No token') },
      },
    },
    '/api/mentors/request': {
      post: {
        tags: ['Mentors'],
        summary: 'Student sends a mentorship request',
        security: bearer,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['mentorId'], properties: { mentorId: { type: 'integer' } } } } },
        },
        responses: {
          201: { description: 'Request sent' },
          400: errorResponse('Invalid mentor id or request already sent'),
          403: errorResponse('Only students can send requests'),
          404: errorResponse('Mentor not found'),
        },
      },
    },
    '/api/mentors/requests': {
      get: {
        tags: ['Mentors'],
        summary: 'Mentor lists the requests they received',
        security: bearer,
        responses: { 200: { description: 'List of requests' }, 403: errorResponse('Only mentors') },
      },
    },
    '/api/mentors/student-requests': {
      get: {
        tags: ['Mentors'],
        summary: 'Student lists the requests they sent',
        security: bearer,
        responses: { 200: { description: 'List of requests' }, 403: errorResponse('Only students') },
      },
    },
    '/api/mentors/request/update': {
      put: {
        tags: ['Mentors'],
        summary: 'Mentor accepts or rejects a request',
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requestId', 'status'],
                properties: { requestId: { type: 'integer' }, status: { type: 'string', enum: ['accepted', 'rejected'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request updated' },
          400: errorResponse('Invalid input'),
          403: errorResponse('Only mentors'),
          404: errorResponse('Request not found or not addressed to you'),
        },
      },
    },
    '/api/mentors/all-users': {
      get: {
        tags: ['Mentors'],
        summary: 'List all users except yourself (used to start conversations)',
        security: bearer,
        responses: { 200: { description: 'List of users' } },
      },
    },

    '/api/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'List all jobs and internships (public)',
        responses: {
          200: { description: 'List of jobs', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Job' } } } } },
        },
      },
      post: {
        tags: ['Jobs'],
        summary: 'Post a job. Students can only post internships.',
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/JobRequest' } } } },
        responses: {
          201: { description: 'Job posted' },
          400: errorResponse('Validation error'),
          401: errorResponse('No token'),
          403: errorResponse('Students can only post internships'),
        },
      },
    },
    '/api/jobs/{id}': {
      delete: {
        tags: ['Jobs'],
        summary: 'Delete one of your own jobs',
        security: bearer,
        parameters: [idParam('id')],
        responses: { 200: { description: 'Job deleted' }, 400: errorResponse('Invalid id'), 404: errorResponse('Not found or not yours') },
      },
    },

    '/api/resources': {
      get: {
        tags: ['Resources'],
        summary: 'List all resources (public)',
        responses: {
          200: { description: 'List of resources', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Resource' } } } } },
        },
      },
      post: {
        tags: ['Resources'],
        summary: 'Share a resource',
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResourceRequest' } } } },
        responses: { 201: { description: 'Resource added' }, 400: errorResponse('Validation error'), 401: errorResponse('No token') },
      },
    },
    '/api/resources/{id}': {
      delete: {
        tags: ['Resources'],
        summary: 'Delete one of your own resources',
        security: bearer,
        parameters: [idParam('id')],
        responses: { 200: { description: 'Resource deleted' }, 400: errorResponse('Invalid id'), 404: errorResponse('Not found or not yours') },
      },
    },

    '/api/messages': {
      post: {
        tags: ['Messages'],
        summary: 'Send a message',
        security: bearer,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageRequest' } } } },
        responses: {
          201: { description: 'Message sent' },
          400: errorResponse('Empty message, invalid receiver, or message to yourself'),
          404: errorResponse('Receiver not found'),
        },
      },
    },
    '/api/messages/conversations': {
      get: { tags: ['Messages'], summary: 'List your conversations, newest first', security: bearer, responses: { 200: { description: 'List of conversations' } } },
    },
    '/api/messages/unread-count': {
      get: { tags: ['Messages'], summary: 'Number of unread messages', security: bearer, responses: { 200: { description: 'Count', content: { 'application/json': { example: { count: 3 } } } } } },
    },
    '/api/messages/unread-users': {
      get: { tags: ['Messages'], summary: 'Users who sent you unread messages', security: bearer, responses: { 200: { description: 'List of sender ids' } } },
    },
    '/api/messages/{otherUserId}': {
      get: {
        tags: ['Messages'],
        summary: 'Get the conversation with another user (marks their messages as read)',
        security: bearer,
        parameters: [idParam('otherUserId')],
        responses: { 200: { description: 'List of messages' }, 400: errorResponse('Invalid user id') },
      },
    },
  },
};
