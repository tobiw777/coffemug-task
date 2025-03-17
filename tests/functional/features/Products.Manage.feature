Feature: Manage products
  Scenario: add new product with invalid payload
    When I clear the database
    Given the new headers is created
    Given I register new user and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 400 as number
    Then it concludes test

  Scenario: add new product with valid payload
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Then it concludes test

  Scenario: restock product with invalid payload
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Given I try to send request /products/%result._body.id%/restock with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 400 as number
    Then it concludes test

  Scenario: restock product with valid payload but not existing product
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value 20 as number
    Given I try to send request /products/67d73cfce8b825c71b17efc3/restock with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 404 as number
    Then it concludes test

  Scenario: restock product with valid payload
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value 20 as number
    Given I try to send request /products/%result._body.id%/restock with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 201 as number
    Then the result2._body.stock should be 80 as number
    Then it concludes test

  Scenario: sell product that not exits
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value 20 as number
    Given I try to send request /products/67d73cfce8b825c71b17efc3/sell with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 404 as number
    Then it concludes test

  Scenario: sell product with invalid payload
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value test
    Given I try to send request /products/%result._body.id%/sell with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 400 as number
    Then it concludes test

  Scenario: sell product with valid payload
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value 20 as number
    Given I try to send request /products/%result._body.id%/sell with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 201 as number
    Then the result2._body.stock should be 40 as number
    Then it concludes test

  Scenario: sell more products than in stock
    Given the new headers is created
    Given I login and save result as userResult with headers as headers
    Given the new productsBody is created
    Then I set productsBody.name to "first product"
    Then I set productsBody.description to "desc"
    Then I set productsBody.stock to value 60 as number
    Then I set productsBody.price to value 12.5 as number
    Given I try to send request /products with method post using productsBody as body using headers as headers and save the result as result
    Then the result.status should be 201 as number
    Given the new productRestockBody is created
    Then I set productRestockBody.quantity to value 80 as number
    Given I try to send request /products/%result._body.id%/sell with method post using productRestockBody as body using headers as headers and save the result as result2
    Then the result2.status should be 422 as number
    Then it concludes test
