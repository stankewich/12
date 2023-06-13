describe('Sign up', () => {

    before(() => {

        cy.request({ method: 'POST', url: '/api/db/undo' })
            .its('status').should('eq', 200);
        cy.request({ method: 'POST', url: '/api/db/seed' })
            .its('status').should('eq', 200);
    });

    beforeEach(() => {
        cy.visit('/');
        cy.get('.navbar').should('be.visible').as('appHeader');
    });

    it('should do register user', () => {

        cy.get('@appHeader').find('a[href$="/register"]').click();
        cy.url().should('include', '/#/register');

        cy.get('.auth-page').as('registerPage');
        cy.get('@registerPage').find('h1').should('have.text', 'Sign up');
        cy.get('@registerPage').find('form').should('be.visible').as('signupForm');
        cy.get('@signupForm').find('input[name=username]').type('test');
        cy.get('@signupForm').find('input[name=email]').type('test@test.com');
        cy.get('@signupForm').find('input[name=password]').type('xyzXYZ123_');
        cy.get('@signupForm').find('button').click();

        cy.get('@appHeader').should('contain.text', 'test');

    });
});