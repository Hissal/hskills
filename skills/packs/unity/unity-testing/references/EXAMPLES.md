# Unity test examples

NUnit counterparts to `tdd`'s good and bad tests and its mocking guidance. The principles are `tdd`'s; these show only the Unity shapes.

- [Behaviour through a plain class](#behaviour-through-a-plain-class)
- [The lifecycle in EditMode](#the-lifecycle-in-editmode)
- [Waiting on a condition](#waiting-on-a-condition)
- [Tautological](#tautological)
- [Cleanup and statics](#cleanup-and-statics)
- [Expected error logs](#expected-error-logs)
- [Seams without a port](#seams-without-a-port)

## Behaviour through a plain class

```csharp
// GOOD: EditMode [Test] against the logic, no GameObject needed
[Test]
public void Taking_damage_below_zero_kills_the_player()
{
    var health = new Health(max: 10);
    health.TakeDamage(12);
    Assert.That(health.IsDead, Is.True);
}
```

A component that only forwards to it needs no test of its own:

```csharp
public class PlayerHealth : MonoBehaviour
{
    [SerializeField] int max = 10;
    Health health;

    void Awake() => health = new Health(max);
    public void OnHit(int damage) => health.TakeDamage(damage);
    public bool IsDead => health.IsDead;
}
```

## The lifecycle in EditMode

```csharp
// BAD: EditMode never runs Awake, so health is null and the test throws
[Test]
public void Player_dies_from_damage()
{
    var player = new GameObject().AddComponent<PlayerHealth>();
    player.OnHit(12);
}
```

Test `Health` directly, as above. When the component itself is under test, use PlayMode, where `Awake` runs inside `AddComponent`:

```csharp
[UnityTest]
public IEnumerator Player_dies_from_damage()
{
    var go = new GameObject();
    var player = go.AddComponent<PlayerHealth>();
    player.OnHit(12);
    yield return null;
    Assert.That(player.IsDead, Is.True);
    Object.Destroy(go);
}
```

## Waiting on a condition

```csharp
// GOOD: polls the state it needs, bounded by real time, and fails saying what it saw
GameObject go;

[TearDown]
public void TearDown() => Object.Destroy(go);   // a failed Assert skips the rest of the test

[UnityTest]
public IEnumerator Opening_the_door_ends_with_it_open()
{
    go = new GameObject();
    var door = go.AddComponent<Door>();

    door.Open();

    const double timeoutSeconds = 5;
    var clock = Stopwatch.StartNew();
    while (!door.IsOpen)
    {
        if (clock.Elapsed.TotalSeconds > timeoutSeconds)
            Assert.Fail($"Door not open after {timeoutSeconds} s; last state: {door.Progress:P0} open.");
        yield return null;
    }
}
```

```csharp
// BAD: a guess at the duration. Flaky when a frame runs long, wasted time when it does not
door.Open();
yield return new WaitForSeconds(1f);
Assert.That(door.IsOpen, Is.True);
```

Used in several tests, the loop becomes a helper in the test helper assembly, yielded as `yield return Wait.Until(() => door.IsOpen, "the door to open", () => $"{door.Progress:P0} open");`:

```csharp
public static class Wait
{
    public static IEnumerator Until(Func<bool> condition, string what, Func<string> lastState, double timeoutSeconds = 5)
    {
        var clock = Stopwatch.StartNew();
        while (!condition())
        {
            if (clock.Elapsed.TotalSeconds > timeoutSeconds)
                Assert.Fail($"Timed out after {timeoutSeconds} s waiting for {what}; last state: {lastState()}.");
            yield return null;
        }
    }
}
```

## Tautological

```csharp
// BAD: expected value recomputed the way the code computes it
Assert.AreEqual(Vector3.forward * speed * dt, mover.Step(dt));

// GOOD: an independent literal, compared with a tolerance
Assert.That(new Mover(speed: 2f).Step(0.5f), Is.EqualTo(new Vector3(0, 0, 1)).Using(Vector3EqualityComparer.Instance));
```

## Cleanup and statics

```csharp
public class SpawnerTests
{
    GameObject root;

    [SetUp]
    public void SetUp()
    {
        EnemyRegistry.Clear();      // statics reset as if domain reload is off
        root = new GameObject("test-root");
    }

    [TearDown]
    public void TearDown() => Object.DestroyImmediate(root);   // EditMode form

    [Test]
    public void Spawning_registers_the_enemy()
    {
        new Spawner(root.transform).Spawn();
        Assert.That(EnemyRegistry.Count, Is.EqualTo(1));
    }
}
```

## Expected error logs

```csharp
[Test]
public void Loading_a_missing_level_logs_an_error()
{
    LogAssert.Expect(LogType.Error, "Level 'nope' not found");   // before the code that logs
    Assert.That(new Levels().Load("nope"), Is.Null);
}
```

## Seams without a port

A passed-in value often does the job of an interface around `Time`:

```csharp
public sealed class Cooldown
{
    float remaining;
    public Cooldown(float duration) => remaining = duration;
    public bool Ready => remaining <= 0f;
    public void Tick(float deltaTime) => remaining -= deltaTime;   // the component passes Time.deltaTime
}

[Test]
public void Cooldown_ends_after_its_duration()
{
    var cooldown = new Cooldown(duration: 1f);
    cooldown.Tick(0.5f);
    cooldown.Tick(0.5f);
    Assert.That(cooldown.Ready, Is.True);
}
```

Where a repo already has its own interface at the seam, or production code gains from one, fake that interface with the project's mocking library or by hand:

```csharp
public interface ILevelStore { string Read(string name); }

sealed class FakeLevelStore : ILevelStore
{
    public string Read(string name) => name == "one" ? "{}" : null;
}
```
