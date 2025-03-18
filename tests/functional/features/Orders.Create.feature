Feature: Create orders
  Scenario: add new order with invalid payload
    When I clear the database
    Given the new headers is created
    Given I register new user and save result as userResult with headers as headers
    Given the new orderCreateBody is created
    Then I set orderCreateBody.products to "first product"
    Given I try to send request /orders with method post using orderCreateBody as body using headers as headers and save the result as result
    Then the result.status should be 400 as number
    Then it concludes test

  Scenario: add new order with product that not exits
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new orderCreateBody is created
    Then I set orderCreateBody.products.0.product_id to "67d73c9ce8b825c71b17efbb"
    Then I set orderCreateBody.products.0.quantity to value 1 as number
    Given I try to send request /orders with method post using orderCreateBody as body using headers as headers and save the result as result
    Then the result.status should be 404 as number
    Then it concludes test

  Scenario: add new order with to many products
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 1 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Given the new orderCreateBody is created
    Then I set orderCreateBody.products.0.product_id to value from result._body.id
    Then I set orderCreateBody.products.0.quantity to value 2 as number
    Given I try to send request /orders with method post using orderCreateBody as body using headers as headers and save the result as result2
    Then the result2.status should be 422 as number
    Then it concludes test

  Scenario: add new order and check stock
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 1 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Given the new orderCreateBody is created
    Then I set orderCreateBody.products.0.product_id to value from result._body.id
    Then I set orderCreateBody.products.0.quantity to value 1 as number
    Given I try to send request /orders with method post using orderCreateBody as body using headers as headers and save the result as result2
    Then the result2.status should be 201 as number
    Given I try to send request /products/%result._body.id% with method get using headers as headers and save the result as result3
    Then the result3.status should be 200 as number
    Then the result3._body.stock should be 0 as number
    Then it concludes test
