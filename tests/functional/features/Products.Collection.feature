Feature: Get products collection
  Scenario: when there are no products
    When I clear the database
    Given I try to send request /products with method get and save the result as result
    Then the result.status should be 200 as number
    Then the result._body.products should be empty array
    Then it concludes test

  Scenario: when there are some products
    Given the new headers is created
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I register new user and save result as userResult with headers as headers
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given I try to send request /products with method get and save the result as resultSecond
    Then the resultSecond.status should be 200 as number
    Then the resultSecond._body.products should not be empty array
    Then it concludes test

  Scenario: when there are some products with filters
    Given I try to send request /products?name=first with method get and save the result as result
    Then the result.status should be 200 as number
    Then the result._body.products should not be empty array
    Given I try to send request /products?name=not with method get and save the result as result1
    Then the result1.status should be 200 as number
    Then the result1._body.products should be empty array
    Then it concludes test
